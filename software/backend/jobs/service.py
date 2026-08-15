"""Route-facing job persistence service."""

from __future__ import annotations

import os
from pathlib import Path

from .service_components import JobServiceComponentAccess
from .service_composition import build_job_service_components
from .service_jobs import JobServiceApi
from .service_molecules import MoleculeServiceApi
from .service_workflows import WorkflowServiceApi

DEFAULT_DATA_ROOT = Path(
    os.getenv(
        "RETAINMOL_DATA_ROOT",
        str(Path(__file__).resolve().parents[1] / "data"),
    )
)


class JobService(
    JobServiceComponentAccess,
    MoleculeServiceApi,
    JobServiceApi,
    WorkflowServiceApi,
):
    """Stable route-facing facade over focused Job domain managers."""

    def __init__(self, data_root: str | Path | None = None) -> None:
        resolved_root = Path(data_root) if data_root is not None else DEFAULT_DATA_ROOT
        self._bind_components(build_job_service_components(resolved_root))
