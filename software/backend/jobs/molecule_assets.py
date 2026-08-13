"""Versioned molecule asset management."""

from __future__ import annotations

import secrets
import sqlite3
from collections.abc import Mapping
from datetime import UTC, datetime
from typing import Any

from .errors import (
    MoleculeAssetNotFoundError,
    MoleculeHeadConflictError,
    MoleculeRevisionNotFoundError,
)
from .models import MoleculeAsset, MoleculeRevision
from .molecule_canonicalize import (
    InvalidMoleculeError,
    molecule_content_hash,
    molecule_topology_fingerprint,
    validate_molecule,
)
from .repository import JobRepository


class MoleculeAssetManager:
    """Owns immutable molecule revisions and compare-and-swap head updates."""

    def __init__(self, repository: JobRepository) -> None:
        self.repository = repository

    def create(
        self, name: str, *, metadata: dict[str, Any] | None = None
    ) -> MoleculeAsset:
        now = _now()
        for _ in range(10):
            asset = MoleculeAsset(
                assetId=f"mol-{secrets.token_hex(8)}",
                name=_required_text(name, "name"),
                schemaVersion=1,
                headRevisionId=None,
                version=1,
                metadata=metadata or {},
                createdAt=now,
                updatedAt=now,
            )
            try:
                self.repository.create_molecule_asset(asset)
            except sqlite3.IntegrityError:
                continue
            return asset
        raise RuntimeError("Unable to allocate a unique molecule asset id")

    def list(self) -> list[MoleculeAsset]:
        return self.repository.list_molecule_assets()

    def get(self, asset_id: str) -> MoleculeAsset:
        asset = self.repository.get_molecule_asset(asset_id)
        if asset is None:
            raise MoleculeAssetNotFoundError(asset_id)
        return asset

    def get_revision(self, revision_id: str) -> MoleculeRevision:
        revision = self.repository.get_molecule_revision(revision_id)
        if revision is None:
            raise MoleculeRevisionNotFoundError(revision_id)
        return revision

    def list_revisions(self, asset_id: str) -> list[MoleculeRevision]:
        self.get(asset_id)
        return self.repository.list_molecule_revisions(asset_id)

    def save_revision(
        self,
        asset_id: str,
        molecule: Mapping[str, Any],
        *,
        parent_revision_id: str | None,
        expected_head_revision_id: str | None,
        expected_version: int,
        content_hash: str | None = None,
        topology_fingerprint: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> MoleculeRevision:
        """Create one immutable snapshot and CAS-advance the asset head."""
        self.get(asset_id)
        if parent_revision_id != expected_head_revision_id:
            raise InvalidMoleculeError(
                "parentRevisionId must match expectedHeadRevisionId"
            )
        snapshot = validate_molecule(dict(molecule))
        computed_content_hash = molecule_content_hash(snapshot)
        computed_topology_fingerprint = molecule_topology_fingerprint(snapshot)
        if content_hash is not None and content_hash != computed_content_hash:
            raise InvalidMoleculeError(
                "contentHash does not match the molecule snapshot"
            )
        if (
            topology_fingerprint is not None
            and topology_fingerprint != computed_topology_fingerprint
        ):
            raise InvalidMoleculeError(
                "topologyFingerprint does not match the molecule topology"
            )
        revision = MoleculeRevision(
            revisionId=f"rev-{secrets.token_hex(8)}",
            schemaVersion=1,
            assetId=asset_id,
            parentRevisionId=parent_revision_id,
            molecule=snapshot,
            contentHash=computed_content_hash,
            topologyFingerprint=computed_topology_fingerprint,
            metadata=metadata or {},
            createdAt=_now(),
        )
        if not self.repository.create_molecule_revision(
            revision,
            expected_head_revision_id,
            expected_version,
        ):
            raise MoleculeHeadConflictError(self.get(asset_id))
        return revision


def _now() -> datetime:
    return datetime.now(UTC)


def _required_text(value: str, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value
