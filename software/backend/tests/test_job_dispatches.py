from __future__ import annotations

import threading
import time
from concurrent.futures import ThreadPoolExecutor

import software.backend.jobs.executor as executor_module
from software.backend.jobs import JobExecutor, JobService


def _service_with_job(tmp_path):
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")
    return service, job


def test_persisted_dispatch_survives_api_executor_replacement(
    monkeypatch, tmp_path
) -> None:
    service, job = _service_with_job(tmp_path)
    api_executor = JobExecutor(max_workers=1)
    assert api_executor.submit(service, job.job_id, start_workers=False) is True
    assert api_executor.snapshot()["queued"] == 1

    completed = threading.Event()

    def fake_run(_service, claimed_job_id, *, stop_check):
        assert claimed_job_id == job.job_id
        assert not stop_check()
        completed.set()

    monkeypatch.setattr(executor_module, "run_persisted_job", fake_run)
    worker_executor = JobExecutor(max_workers=1, poll_seconds=0.05)
    try:
        worker_executor.start(JobService(tmp_path / "data"))
        assert completed.wait(timeout=1)
        deadline = time.monotonic() + 1
        while worker_executor.snapshot()["leased"] and time.monotonic() < deadline:
            time.sleep(0.01)
        dispatch = service.repository.get_job_dispatch(job.job_id)
        assert dispatch is not None
        assert dispatch.status == "finished"
    finally:
        worker_executor.shutdown()


def test_only_one_process_can_lease_a_dispatch(tmp_path) -> None:
    service, job = _service_with_job(tmp_path)
    assert service.request_job_dispatch(job.job_id, max_inflight=8)

    def claim(index: int):
        contender = JobService(tmp_path / "data")
        return contender.claim_next_dispatch(
            worker_id=f"worker-{index}",
            lease_token=f"token-{index}",
            lease_seconds=30,
        )

    with ThreadPoolExecutor(max_workers=2) as pool:
        claims = list(pool.map(claim, (1, 2)))

    leased = [dispatch for dispatch in claims if dispatch is not None]
    assert len(leased) == 1
    assert leased[0].job_id == job.job_id


def test_expired_unstarted_lease_returns_to_pending_queue(tmp_path) -> None:
    service, job = _service_with_job(tmp_path)
    assert service.request_job_dispatch(job.job_id, max_inflight=8)
    first = service.claim_next_dispatch(
        worker_id="worker-1",
        lease_token="token-1",
        lease_seconds=0.01,
    )
    assert first is not None
    time.sleep(0.02)

    second = service.claim_next_dispatch(
        worker_id="worker-2",
        lease_token="token-2",
        lease_seconds=30,
    )

    assert second is not None
    assert second.job_id == job.job_id
    assert second.lease_owner == "worker-2"


def test_expired_running_lease_interrupts_job(tmp_path) -> None:
    service, job = _service_with_job(tmp_path)
    assert service.request_job_dispatch(job.job_id, max_inflight=8)
    dispatch = service.claim_next_dispatch(
        worker_id="worker-1",
        lease_token="token-1",
        lease_seconds=0.01,
    )
    assert dispatch is not None
    assert service.claim_queued_job(job.job_id) is not None
    time.sleep(0.02)

    recovered = service.recover_stale_executions()

    assert [item.job_id for item in recovered] == [job.job_id]
    interrupted = service.get_job(job.job_id)
    assert interrupted.status == "interrupted"
    assert interrupted.error_code == "worker_lease_expired"
