"""Molecule asset methods exposed by :class:`JobService`."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .models import MoleculeAsset, MoleculeRevision
from .molecule_assets import MoleculeAssetManager


class MoleculeServiceApi:
    """Typed molecule-asset facade mixed into the route-facing service."""

    molecule_assets: MoleculeAssetManager

    def create_molecule_asset(
        self, name: str, *, metadata: dict[str, Any] | None = None
    ) -> MoleculeAsset:
        return self.molecule_assets.create(name, metadata=metadata)

    def list_molecule_assets(self) -> list[MoleculeAsset]:
        return self.molecule_assets.list()

    def get_molecule_asset(self, asset_id: str) -> MoleculeAsset:
        return self.molecule_assets.get(asset_id)

    def get_molecule_revision(self, revision_id: str) -> MoleculeRevision:
        return self.molecule_assets.get_revision(revision_id)

    def list_molecule_revisions(self, asset_id: str) -> list[MoleculeRevision]:
        return self.molecule_assets.list_revisions(asset_id)

    def save_molecule_revision(
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
        return self.molecule_assets.save_revision(
            asset_id,
            molecule,
            parent_revision_id=parent_revision_id,
            expected_head_revision_id=expected_head_revision_id,
            expected_version=expected_version,
            content_hash=content_hash,
            topology_fingerprint=topology_fingerprint,
            metadata=metadata,
        )
