"""Registry for JobType implementations used by durable workers."""

from __future__ import annotations

from collections.abc import Iterable

from .base import JobTypeHandler


class UnknownJobTypeError(LookupError):
    """Raised when no implementation is registered for a JobType."""


class DuplicateJobTypeError(ValueError):
    """Raised when two implementations claim the same JobType."""


class JobTypeRegistry:
    """Resolve exact JobType identifiers without engine-specific conditionals."""

    def __init__(self, handlers: Iterable[JobTypeHandler] = ()) -> None:
        self._handlers: dict[str, JobTypeHandler] = {}
        for handler in handlers:
            self.register(handler)

    def register(self, handler: JobTypeHandler) -> None:
        job_type = _normalize_job_type(handler.job_type)
        if job_type in self._handlers:
            raise DuplicateJobTypeError(f"JobType is already registered: {job_type}")
        self._handlers[job_type] = handler

    def resolve(self, job_type: str) -> JobTypeHandler:
        normalized = _normalize_job_type(job_type)
        try:
            return self._handlers[normalized]
        except KeyError as exc:
            raise UnknownJobTypeError(
                f"No JobType implementation is registered for '{normalized}'"
            ) from exc

    def supports(self, job_type: str) -> bool:
        try:
            normalized = _normalize_job_type(job_type)
        except ValueError:
            return False
        return normalized in self._handlers

    def list_job_types(self) -> tuple[str, ...]:
        return tuple(sorted(self._handlers))


def _normalize_job_type(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("job_type must be a non-empty string")
    return value.strip()


__all__ = [
    "DuplicateJobTypeError",
    "JobTypeRegistry",
    "UnknownJobTypeError",
]
