"""Repository tests for versioned molecule assets and immutable revisions."""

from __future__ import annotations

import sqlite3
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta

import pytest

from software.backend.jobs.models import MoleculeAsset, MoleculeRevision
from software.backend.jobs.repository import JobRepository


NOW = datetime(2026, 7, 14, 8, 0, tzinfo=UTC)
LATER = NOW + timedelta(minutes=1)


def _asset(asset_id: str, name: str = "Water") -> MoleculeAsset:
    return MoleculeAsset(
        assetId=asset_id,
        name=name,
        metadata={"source": "editor"},
        createdAt=NOW,
        updatedAt=NOW,
    )


def _revision(
    revision_id: str,
    asset_id: str,
    *,
    parent_revision_id: str | None = None,
    created_at: datetime = NOW,
) -> MoleculeRevision:
    return MoleculeRevision(
        revisionId=revision_id,
        assetId=asset_id,
        parentRevisionId=parent_revision_id,
        molecule={"name": "water", "atoms": [], "bonds": []},
        contentHash="a" * 64,
        topologyFingerprint="b" * 64,
        createdAt=created_at,
    )


def test_create_get_and_list_assets(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    older = _asset("asset-older")
    newer = _asset("asset-newer", "Methane").model_copy(
        update={"created_at": LATER, "updated_at": LATER}
    )

    repository.create_molecule_asset(older)
    repository.create_molecule_asset(newer)

    assert repository.get_molecule_asset(older.asset_id) == older
    assert repository.get_molecule_asset("missing") is None
    assert repository.list_molecule_assets() == [newer, older]


def test_create_revision_atomically_advances_head_and_lists_history(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_molecule_asset(_asset("asset-1"))
    first = _revision("revision-1", "asset-1")
    second = _revision(
        "revision-2",
        "asset-1",
        parent_revision_id=first.revision_id,
        created_at=LATER,
    )

    assert repository.create_molecule_revision(first, None) is True
    assert repository.create_molecule_revision(second, first.revision_id) is True

    assert repository.get_molecule_revision(first.revision_id) == first
    assert repository.get_molecule_revision("missing") is None
    assert repository.list_molecule_revisions("asset-1") == [first, second]
    asset = repository.get_molecule_asset("asset-1")
    assert asset is not None
    assert asset.head_revision_id == second.revision_id
    assert asset.version == 3
    assert asset.updated_at == LATER


def test_stale_expected_head_rolls_back_revision_insert(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_molecule_asset(_asset("asset-1"))
    first = _revision("revision-1", "asset-1")
    stale = _revision("revision-stale", "asset-1", created_at=LATER)
    assert repository.create_molecule_revision(first, None) is True

    assert repository.create_molecule_revision(stale, None) is False

    assert repository.get_molecule_revision(stale.revision_id) is None
    assert repository.get_molecule_asset("asset-1").head_revision_id == first.revision_id


def test_concurrent_revision_writes_accept_only_one_expected_head(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_molecule_asset(_asset("asset-1"))
    left = _revision("revision-left", "asset-1")
    right = _revision("revision-right", "asset-1")

    with ThreadPoolExecutor(max_workers=2) as executor:
        results = list(
            executor.map(
                lambda revision: repository.create_molecule_revision(revision, None),
                (left, right),
            )
        )

    assert sorted(results) == [False, True]
    revisions = repository.list_molecule_revisions("asset-1")
    assert len(revisions) == 1
    assert repository.get_molecule_asset("asset-1").head_revision_id == revisions[0].revision_id


def test_parent_revision_must_exist_and_belong_to_same_asset(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_molecule_asset(_asset("asset-1"))
    repository.create_molecule_asset(_asset("asset-2", "Methane"))
    parent = _revision("revision-parent", "asset-1")
    assert repository.create_molecule_revision(parent, None) is True

    missing_parent = _revision(
        "revision-missing-parent", "asset-2", parent_revision_id="missing"
    )
    with pytest.raises(ValueError, match="does not exist"):
        repository.create_molecule_revision(missing_parent, None)

    foreign_parent = _revision(
        "revision-foreign-parent",
        "asset-2",
        parent_revision_id=parent.revision_id,
    )
    with pytest.raises(ValueError, match="same molecule asset"):
        repository.create_molecule_revision(foreign_parent, None)

    assert repository.list_molecule_revisions("asset-2") == []


def test_head_cas_only_accepts_a_revision_from_the_same_asset(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_molecule_asset(_asset("asset-1"))
    repository.create_molecule_asset(_asset("asset-2", "Methane"))
    first = _revision("revision-1", "asset-1")
    branch = _revision("revision-branch", "asset-1", created_at=LATER)
    foreign = _revision("revision-foreign", "asset-2")
    assert repository.create_molecule_revision(first, None) is True
    assert repository.create_molecule_revision(branch, first.revision_id) is True
    assert repository.create_molecule_revision(foreign, None) is True

    assert repository.advance_molecule_asset_head(
        "asset-1", first.revision_id, first.revision_id, LATER
    ) is False
    assert repository.get_molecule_asset("asset-1").head_revision_id == branch.revision_id

    assert repository.advance_molecule_asset_head(
        "asset-1", first.revision_id, branch.revision_id, LATER
    ) is True
    assert repository.get_molecule_asset("asset-1").head_revision_id == first.revision_id

    with pytest.raises(ValueError, match="must belong"):
        repository.advance_molecule_asset_head(
            "asset-1", foreign.revision_id, first.revision_id, LATER
        )


def test_revision_rows_are_insert_only_through_repository(tmp_path) -> None:
    repository = JobRepository(tmp_path / "jobs.sqlite")
    repository.create_molecule_asset(_asset("asset-1"))
    revision = _revision("revision-1", "asset-1")
    assert repository.create_molecule_revision(revision, None) is True

    changed = revision.model_copy(update={"structure": {"atoms": [{"id": "new"}]}})
    with pytest.raises(sqlite3.IntegrityError):
        repository.create_molecule_revision(changed, revision.revision_id)
    assert repository.get_molecule_revision(revision.revision_id) == revision

    with repository._connection() as connection:
        with pytest.raises(sqlite3.IntegrityError, match="immutable"):
            connection.execute(
                "UPDATE molecule_revisions SET structure_json = '{}' WHERE revision_id = ?",
                (revision.revision_id,),
            )
