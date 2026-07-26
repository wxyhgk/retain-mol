"""JobType extension boundary for persisted calculation jobs."""

from .base import JobTypeHandler, StopCheck
from .builtins import build_builtin_job_type_registry
from .registry import DuplicateJobTypeError, JobTypeRegistry, UnknownJobTypeError
from .results import ResultCollector


JOB_TYPE_REGISTRY = build_builtin_job_type_registry()


__all__ = [
    "DuplicateJobTypeError",
    "JOB_TYPE_REGISTRY",
    "JobTypeHandler",
    "JobTypeRegistry",
    "ResultCollector",
    "StopCheck",
    "UnknownJobTypeError",
    "build_builtin_job_type_registry",
]
