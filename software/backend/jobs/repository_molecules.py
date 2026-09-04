"""Molecule asset and revision persistence operations."""

from __future__ import annotations

import sqlite3
from datetime import datetime

from .models import MoleculeAsset, MoleculeRevision
from .repository_records import _json_dump, _timestamp


class MoleculeRepositoryMixin:
    """Persist immutable molecule revisions behind optimistic asset heads."""

    def create_molecule_asset(self, asset: MoleculeAsset) -> None:
        if asset.head_revision_id is not None:
            raise ValueError("a new molecule asset cannot already have a head revision")
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO molecule_assets
                    (asset_id, name, metadata_json, head_revision_id, version,
                     created_at, updated_at)
                VALUES (?, ?, ?, NULL, ?, ?, ?)
                """,
                (
                    asset.asset_id,
                    asset.name,
                    _json_dump(asset.metadata),
                    asset.version,
                    _timestamp(asset.created_at),
                    _timestamp(asset.updated_at),
                ),
            )

    def get_molecule_asset(self, asset_id: str) -> MoleculeAsset | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM molecule_assets WHERE asset_id = ?", (asset_id,)
            ).fetchone()
        return self._molecule_asset_from_row(row) if row is not None else None

    def list_molecule_assets(self) -> list[MoleculeAsset]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM molecule_assets
                ORDER BY updated_at DESC, asset_id DESC
                """
            ).fetchall()
        return [self._molecule_asset_from_row(row) for row in rows]

    def create_molecule_revision(
        self,
        revision: MoleculeRevision,
        expected_head_revision_id: str | None,
        expected_version: int | None = None,
    ) -> bool:
        """Create a revision and move its asset head in one optimistic transaction."""
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            asset_row = connection.execute(
                "SELECT * FROM molecule_assets WHERE asset_id = ?",
                (revision.asset_id,),
            ).fetchone()
            if asset_row is None:
                raise ValueError(f"molecule asset does not exist: {revision.asset_id}")

            current_head_revision_id = asset_row["head_revision_id"]
            if current_head_revision_id != expected_head_revision_id:
                return False
            if expected_version is not None and asset_row["version"] != expected_version:
                return False

            self._validate_molecule_revision_parent(connection, revision)
            self._insert_molecule_revision(connection, revision)
            cursor = connection.execute(
                """
                UPDATE molecule_assets
                SET head_revision_id = ?, version = version + 1, updated_at = ?
                WHERE asset_id = ? AND head_revision_id IS ? AND version = ?
                """,
                (
                    revision.revision_id,
                    _timestamp(revision.created_at),
                    revision.asset_id,
                    expected_head_revision_id,
                    asset_row["version"],
                ),
            )
            if cursor.rowcount != 1:
                raise sqlite3.IntegrityError("molecule asset head changed during save")
            return True

    def get_molecule_revision(self, revision_id: str) -> MoleculeRevision | None:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM molecule_revisions WHERE revision_id = ?",
                (revision_id,),
            ).fetchone()
        return self._molecule_revision_from_row(row) if row is not None else None

    def list_molecule_revisions(self, asset_id: str) -> list[MoleculeRevision]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT * FROM molecule_revisions
                WHERE asset_id = ?
                ORDER BY created_at, revision_id
                """,
                (asset_id,),
            ).fetchall()
        return [self._molecule_revision_from_row(row) for row in rows]

    def advance_molecule_asset_head(
        self,
        asset_id: str,
        revision_id: str,
        expected_head_revision_id: str | None,
        updated_at: datetime,
        expected_version: int | None = None,
    ) -> bool:
        """Point an asset at one of its revisions if its current head is expected."""
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            asset_row = connection.execute(
                "SELECT head_revision_id, version FROM molecule_assets WHERE asset_id = ?",
                (asset_id,),
            ).fetchone()
            if asset_row is None:
                return False

            revision_row = connection.execute(
                "SELECT asset_id FROM molecule_revisions WHERE revision_id = ?",
                (revision_id,),
            ).fetchone()
            if revision_row is None:
                raise ValueError(f"molecule revision does not exist: {revision_id}")
            if revision_row["asset_id"] != asset_id:
                raise ValueError("head revision must belong to the molecule asset")

            if asset_row["head_revision_id"] != expected_head_revision_id:
                return False
            if expected_version is not None and asset_row["version"] != expected_version:
                return False
            cursor = connection.execute(
                """
                UPDATE molecule_assets
                SET head_revision_id = ?, version = version + 1, updated_at = ?
                WHERE asset_id = ? AND head_revision_id IS ? AND version = ?
                """,
                (
                    revision_id,
                    _timestamp(updated_at),
                    asset_id,
                    expected_head_revision_id,
                    asset_row["version"],
                ),
            )
            return cursor.rowcount == 1

    @staticmethod
    def _validate_molecule_revision_parent(
        connection: sqlite3.Connection, revision: MoleculeRevision
    ) -> None:
        if revision.parent_revision_id is None:
            return
        parent_row = connection.execute(
            "SELECT asset_id FROM molecule_revisions WHERE revision_id = ?",
            (revision.parent_revision_id,),
        ).fetchone()
        if parent_row is None:
            raise ValueError(
                f"parent molecule revision does not exist: {revision.parent_revision_id}"
            )
        if parent_row["asset_id"] != revision.asset_id:
            raise ValueError("parent revision must belong to the same molecule asset")

    @staticmethod
    def _insert_molecule_revision(
        connection: sqlite3.Connection, revision: MoleculeRevision
    ) -> None:
        connection.execute(
            """
            INSERT INTO molecule_revisions
                (revision_id, asset_id, parent_revision_id, structure_json,
                 sha256, schema_version, topology_fingerprint, metadata_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                revision.revision_id,
                revision.asset_id,
                revision.parent_revision_id,
                _json_dump(revision.structure),
                revision.sha256,
                revision.schema_version,
                revision.topology_fingerprint,
                _json_dump(revision.metadata),
                _timestamp(revision.created_at),
            ),
        )
