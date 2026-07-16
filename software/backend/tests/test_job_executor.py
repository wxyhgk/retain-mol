from __future__ import annotations

import threading
import time
import software.backend.jobs.executor as executor_module
from software.backend.jobs import JobExecutor, JobService


def _workflow_chain(service: JobService):
    source = service.create_calculation_job(
        "xtb-optimization",
        "xtb",
        {
            "charge": 0,
            "multiplicity": 1,
            "method": "gfn2",
            "maxSteps": 50,
            "optLevel": "normal",
            "structure": {
                "atoms": [
                    {"id": "H1", "symbol": "H", "x": 0, "y": 0, "z": 0}
                ]
            },
        },
    )
    target = service.create_calculation_draft(
        "xtb-optimization",
        "xtb",
        {
            "charge": 0,
            "multiplicity": 1,
            "method": "gfn2",
            "maxSteps": 50,
            "optLevel": "normal",
        },
    )
    workflow = service.create_workflow(
        "executor chain",
        [source.job_id, target.job_id],
        [
            {
                "sourceJobId": source.job_id,
                "sourceKind": "artifact",
                "sourceName": "optimized.xyz",
                "targetJobId": target.job_id,
                "targetInputName": "structure",
            }
        ],
    )
    return workflow, source, target


def _queued_jobs(tmp_path, count: int):
    service = JobService(tmp_path / "data")
    jobs = [service.create_job("xtb-optimization") for _ in range(count)]
    return service, jobs


def test_executor_deduplicates_submission_and_returns_before_completion(
    monkeypatch, tmp_path,
) -> None:
    service, jobs = _queued_jobs(tmp_path, 1)
    job_id = jobs[0].job_id
    started = threading.Event()
    release = threading.Event()

    def fake_run(_service, job_id, *, stop_check):
        assert job_id == jobs[0].job_id
        assert not stop_check()
        started.set()
        release.wait(timeout=2)

    monkeypatch.setattr(executor_module, "run_persisted_job", fake_run)
    executor = JobExecutor(max_workers=1, max_queue_size=2)
    try:
        assert executor.submit(service, job_id) is True
        assert started.wait(timeout=1)
        assert executor.submit(service, job_id) is False
        assert executor.snapshot()["activeJobIds"] == [job_id]
    finally:
        release.set()
        executor.shutdown()


def test_executor_honors_worker_limit(monkeypatch, tmp_path) -> None:
    service, jobs = _queued_jobs(tmp_path, 2)
    release = threading.Event()
    active = 0
    maximum_active = 0
    completed: list[str] = []
    lock = threading.Lock()

    def fake_run(_service, job_id, *, stop_check):
        nonlocal active, maximum_active
        with lock:
            active += 1
            maximum_active = max(maximum_active, active)
        release.wait(timeout=2)
        with lock:
            active -= 1
            completed.append(job_id)

    monkeypatch.setattr(executor_module, "run_persisted_job", fake_run)
    executor = JobExecutor(max_workers=1, max_queue_size=2)
    try:
        executor.submit(service, jobs[0].job_id)
        executor.submit(service, jobs[1].job_id)
        deadline = time.monotonic() + 1
        while not executor.snapshot()["activeJobIds"] and time.monotonic() < deadline:
            time.sleep(0.01)
        assert len(executor.snapshot()["activeJobIds"]) == 1
        assert executor.snapshot()["queued"] == 1
        release.set()
        deadline = time.monotonic() + 1
        while len(completed) < 2 and time.monotonic() < deadline:
            time.sleep(0.01)
        assert completed == [jobs[0].job_id, jobs[1].job_id]
        assert maximum_active == 1
    finally:
        release.set()
        executor.shutdown()


def test_executor_shutdown_propagates_stop_signal(monkeypatch, tmp_path) -> None:
    service, jobs = _queued_jobs(tmp_path, 1)
    started = threading.Event()
    observed_stop = threading.Event()

    def fake_run(_service, _job_id, *, stop_check):
        started.set()
        while not stop_check():
            time.sleep(0.01)
        observed_stop.set()

    monkeypatch.setattr(executor_module, "run_persisted_job", fake_run)
    executor = JobExecutor(max_workers=1, max_queue_size=1)
    executor.submit(service, jobs[0].job_id)
    assert started.wait(timeout=1)

    executor.shutdown()

    assert observed_stop.is_set()
    assert executor.snapshot()["started"] is False


def test_startup_marks_orphaned_running_jobs_interrupted(tmp_path) -> None:
    service = JobService(tmp_path / "data")
    job = service.create_job("xtb-optimization")
    assert service.claim_queued_job(job.job_id) is not None
    executor = JobExecutor(max_workers=1)
    try:
        executor.start(service)
        recovered = service.get_job(job.job_id)
        assert recovered.status == "interrupted"
        assert recovered.error_code == "worker_lease_expired"
        assert recovered.finished_at is not None
    finally:
        executor.shutdown()


def test_executor_runs_ready_nodes_and_automatically_dispatches_downstream(
    monkeypatch, tmp_path,
) -> None:
    service = JobService(tmp_path / "data")
    workflow, source, target = _workflow_chain(service)
    completed: list[str] = []

    def fake_run(current_service, job_id, *, stop_check):
        assert not stop_check()
        assert current_service.claim_queued_job(job_id) is not None
        if job_id == source.job_id:
            output = current_service.task_directory(job_id) / "optimized.xyz"
            output.write_text("1\nsource\nH 0 0 0\n", encoding="utf-8")
            current_service.add_artifact(
                job_id,
                "optimized.xyz",
                "optimized.xyz",
                metadata={"role": "output", "format": "xyz"},
            )
        current_service.update_status(job_id, "succeeded")
        completed.append(job_id)

    monkeypatch.setattr(executor_module, "run_persisted_job", fake_run)
    executor = JobExecutor(max_workers=1, max_queue_size=4, poll_seconds=0.05)
    try:
        executor.submit_workflow(service, workflow.workflow_id)
        deadline = time.monotonic() + 3
        while len(completed) < 2 and time.monotonic() < deadline:
            time.sleep(0.01)

        assert completed == [source.job_id, target.job_id]
        schedule = service.get_workflow_schedule(workflow.workflow_id)
        assert schedule.execution.status == "succeeded"
        assert [node.state for node in schedule.nodes] == ["succeeded", "succeeded"]
    finally:
        executor.shutdown()


def test_cancelling_running_workflow_stops_worker_and_never_dispatches_downstream(
    monkeypatch, tmp_path,
) -> None:
    service = JobService(tmp_path / "data")
    workflow, source, target = _workflow_chain(service)
    started = threading.Event()
    observed_cancel = threading.Event()

    def fake_run(current_service, job_id, *, stop_check):
        assert job_id == source.job_id
        assert current_service.claim_queued_job(job_id) is not None
        started.set()
        deadline = time.monotonic() + 2
        while time.monotonic() < deadline:
            if current_service.get_job(job_id).status == "cancelled":
                observed_cancel.set()
                return
            if stop_check():
                return
            time.sleep(0.01)

    monkeypatch.setattr(executor_module, "run_persisted_job", fake_run)
    executor = JobExecutor(max_workers=1, max_queue_size=4, poll_seconds=0.05)
    try:
        executor.submit_workflow(service, workflow.workflow_id)
        assert started.wait(timeout=1)

        schedule = service.cancel_workflow_execution(workflow.workflow_id)

        assert schedule.execution.status == "cancelled"
        assert observed_cancel.wait(timeout=1)
        deadline = time.monotonic() + 1
        while executor.snapshot()["activeJobIds"] and time.monotonic() < deadline:
            time.sleep(0.01)
        assert service.get_job(source.job_id).status == "cancelled"
        assert service.get_job(target.job_id).status == "cancelled"
        assert service.repository.get_job_dispatch(source.job_id).status == "finished"
        assert service.repository.get_job_dispatch(target.job_id) is None
    finally:
        executor.shutdown()


def test_new_executor_resumes_an_active_workflow_from_durable_dispatch(
    monkeypatch, tmp_path,
) -> None:
    service = JobService(tmp_path / "data")
    workflow, source, target = _workflow_chain(service)
    completed: list[str] = []

    def fake_run(current_service, job_id, *, stop_check):
        assert current_service.claim_queued_job(job_id) is not None
        if job_id == source.job_id:
            output = current_service.task_directory(job_id) / "optimized.xyz"
            output.write_text("1\nsource\nH 0 0 0\n", encoding="utf-8")
            current_service.add_artifact(
                job_id,
                "optimized.xyz",
                "optimized.xyz",
                metadata={"role": "output", "format": "xyz"},
            )
        current_service.update_status(job_id, "succeeded")
        completed.append(job_id)

    monkeypatch.setattr(executor_module, "run_persisted_job", fake_run)
    api_executor = JobExecutor(max_workers=1, max_queue_size=4)
    api_executor.submit_workflow(
        service, workflow.workflow_id, start_workers=False
    )
    assert service.repository.get_job_dispatch(source.job_id) is not None

    worker_executor = JobExecutor(
        max_workers=1, max_queue_size=4, poll_seconds=0.05
    )
    try:
        worker_executor.start(JobService(tmp_path / "data"))
        deadline = time.monotonic() + 3
        while len(completed) < 2 and time.monotonic() < deadline:
            time.sleep(0.01)

        assert completed == [source.job_id, target.job_id]
        assert (
            service.get_workflow_schedule(workflow.workflow_id).execution.status
            == "succeeded"
        )
    finally:
        worker_executor.shutdown()
