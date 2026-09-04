"""Regression: the SSE streaming path must never leak orphan xtb processes.

Before the fix, a client disconnect (Starlette calls ``aclose()`` on the
response generator) deleted the work directory but left the xtb subprocess
running to completion, and the streaming path had no timeout at all (the
synchronous path has always had one).
"""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

import pytest

import software.backend.engines.xtb.execution as xtb_execution
from software.backend.engines.xtb import XtbAtom, XtbOptimizationRequest
from software.backend.engines.xtb.errors import XtbExecutionTimeoutError


def _request() -> XtbOptimizationRequest:
    return XtbOptimizationRequest(
        atoms=[
            XtbAtom(id="h1", symbol="H", x=0.0, y=0.0, z=0.0),
            XtbAtom(id="h2", symbol="H", x=0.0, y=0.0, z=0.7),
        ]
    )


def _alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    return True


def _fake_long_command(
    monkeypatch: pytest.MonkeyPatch, pid_file: Path
) -> None:
    script = f"echo $$ > '{pid_file}'; exec sleep 30"
    monkeypatch.setattr(
        xtb_execution,
        "build_xtb_command",
        lambda *_args, **_kwargs: ["/bin/sh", "-c", script],
    )


async def _wait_for_pid(pid_file: Path) -> int:
    deadline = asyncio.get_running_loop().time() + 5.0
    while not pid_file.exists() or not pid_file.read_text().strip():
        if asyncio.get_running_loop().time() > deadline:
            raise AssertionError("subprocess never wrote its pid")
        await asyncio.sleep(0.05)
    return int(pid_file.read_text().strip())


async def _assert_process_dies(pid: int) -> None:
    deadline = asyncio.get_running_loop().time() + 5.0
    while _alive(pid):
        if asyncio.get_running_loop().time() > deadline:
            raise AssertionError(f"orphan process {pid} is still alive")
        await asyncio.sleep(0.05)


def test_client_disconnect_terminates_the_xtb_subprocess(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    pid_file = tmp_path / "pid.txt"
    _fake_long_command(monkeypatch, pid_file)

    async def scenario() -> None:
        events = xtb_execution.stream_xtb_optimization_events(_request())
        assert (await events.__anext__())["type"] == "status"
        # Pulling the second event starts the subprocess and enters the loop.
        assert (await events.__anext__())["type"] == "status"
        pid = await _wait_for_pid(pid_file)
        assert _alive(pid)

        # A client disconnect makes Starlette close the response generator.
        await events.aclose()

        await _assert_process_dies(pid)

    asyncio.run(scenario())


def test_stream_timeout_raises_and_terminates_the_subprocess(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    pid_file = tmp_path / "pid.txt"
    _fake_long_command(monkeypatch, pid_file)

    async def scenario() -> None:
        events = xtb_execution.stream_xtb_optimization_events(
            _request(), timeout=0.3
        )
        with pytest.raises(XtbExecutionTimeoutError, match=r"0\.3"):
            async for _event in events:
                pass

        pid = await _wait_for_pid(pid_file)
        await _assert_process_dies(pid)

    asyncio.run(scenario())
