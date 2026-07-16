"""Standalone durable calculation worker entry point."""

from __future__ import annotations

import argparse
import logging
import signal
import threading
from pathlib import Path

from .executor import JobExecutor
from .service import JobService


def main() -> int:
    parser = argparse.ArgumentParser(description="Run RetainMol calculation workers")
    parser.add_argument(
        "--data-root",
        type=Path,
        default=None,
        help="Shared RetainMol data directory (defaults to RETAINMOL_DATA_ROOT)",
    )
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)

    service = JobService(args.data_root) if args.data_root is not None else JobService()
    executor = JobExecutor()
    stopping = threading.Event()

    def request_stop(_signum: int, _frame: object) -> None:
        stopping.set()

    signal.signal(signal.SIGINT, request_stop)
    signal.signal(signal.SIGTERM, request_stop)
    executor.start(service)
    try:
        stopping.wait()
    finally:
        executor.shutdown()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
