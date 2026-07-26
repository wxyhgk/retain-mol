"""Stable xTB engine exceptions independent of transport and jobs."""


class XtbExecutionError(RuntimeError):
    """Base error for a failed xTB invocation or invalid result."""


class XtbInvalidStructureError(XtbExecutionError):
    """Raised when xTB cannot run for the supplied structure."""


class XtbExecutableNotFoundError(XtbExecutionError):
    """Raised when the xTB executable is not available on PATH."""


class XtbExecutionTimeoutError(XtbExecutionError):
    """Raised when a synchronous xTB invocation exceeds its deadline."""


class XtbMissingOutputError(XtbExecutionError):
    """Raised when xTB exits without any usable optimized coordinates."""


__all__ = [
    "XtbExecutableNotFoundError",
    "XtbExecutionError",
    "XtbExecutionTimeoutError",
    "XtbInvalidStructureError",
    "XtbMissingOutputError",
]
