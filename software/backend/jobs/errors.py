"""Domain errors shared by job services and focused collaborators."""

from __future__ import annotations

from .models import MoleculeAsset


class JobNotFoundError(KeyError):
    """Raised when an operation targets a job that is not persisted."""


class WorkflowNotFoundError(KeyError):
    """Raised when an operation targets a workflow that is not persisted."""


class InvalidJobTransitionError(ValueError):
    """Raised when a job lifecycle operation would violate the state machine."""


class InvalidJobInputError(ValueError):
    """Raised when calculation inputs cannot be frozen safely."""


class InvalidJobOperationError(ValueError):
    """Raised when a management operation conflicts with the job lifecycle."""


class JobInUseError(ValueError):
    """Raised when a workflow still references a job targeted for deletion."""


class MoleculeAssetNotFoundError(KeyError):
    """Raised when a molecule asset id has no persisted aggregate."""


class MoleculeRevisionNotFoundError(KeyError):
    """Raised when a molecule revision id has no immutable snapshot."""


class MoleculeHeadConflictError(RuntimeError):
    """Raised when optimistic head/version expectations are stale."""

    def __init__(self, asset: MoleculeAsset) -> None:
        self.asset = asset
        super().__init__(f"Molecule asset '{asset.asset_id}' head changed")
