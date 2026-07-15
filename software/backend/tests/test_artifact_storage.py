"""Tests for immutable, content-addressed artifact storage."""

from __future__ import annotations

import hashlib
import os
from pathlib import Path

import pytest

from software.backend.jobs.artifact_storage import (
    ArtifactIntegrityError,
    ArtifactStorage,
    InvalidStorageKeyError,
)


def test_publishes_file_by_sha256_with_atomic_rename(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    content = b"immutable artifact\n"
    source = tmp_path / "result.json"
    source.write_bytes(content)
    data_directory = tmp_path / "data"
    storage = ArtifactStorage(data_directory)
    rename_calls: list[tuple[Path, Path]] = []
    real_rename = os.rename

    def track_rename(source_path: str | os.PathLike[str], destination_path: str | os.PathLike[str]) -> None:
        rename_calls.append((Path(source_path), Path(destination_path)))
        real_rename(source_path, destination_path)

    monkeypatch.setattr(os, "rename", track_rename)

    published = storage.publish_file(source)

    sha256 = hashlib.sha256(content).hexdigest()
    expected_path = data_directory / "artifacts" / "sha256" / sha256[:2] / sha256
    assert published == {
        "storageKey": f"sha256/{sha256[:2]}/{sha256}",
        "sha256": sha256,
        "byteSize": len(content),
    }
    assert expected_path.read_bytes() == content
    assert rename_calls == [(rename_calls[0][0], expected_path)]
    assert rename_calls[0][0].parent == data_directory / "artifacts" / "sha256"
    assert not rename_calls[0][0].exists()


def test_deduplicates_same_content_without_replacing_existing_file(tmp_path: Path) -> None:
    storage = ArtifactStorage(tmp_path / "data")
    content = b"same bytes"

    first = storage.publish_bytes(content)
    destination = storage.resolve(str(first["storageKey"]))
    first_stat = destination.stat()
    second = storage.publish_bytes(content)
    second_stat = destination.stat()

    assert second == first
    assert second_stat.st_ino == first_stat.st_ino
    assert second_stat.st_mtime_ns == first_stat.st_mtime_ns
    assert list(storage.sha256_root.glob(".artifact-*")) == []


def test_refuses_to_overwrite_corrupt_existing_object(tmp_path: Path) -> None:
    storage = ArtifactStorage(tmp_path / "data")
    content = b"expected content"
    sha256 = hashlib.sha256(content).hexdigest()
    destination = storage.sha256_root / sha256[:2] / sha256
    destination.parent.mkdir(parents=True)
    destination.write_bytes(b"occupied")

    with pytest.raises(ArtifactIntegrityError, match="refusing to overwrite"):
        storage.publish(content)

    assert destination.read_bytes() == b"occupied"
    assert list(storage.sha256_root.glob(".artifact-*")) == []


@pytest.mark.parametrize(
    "storage_key",
    [
        "../sha256/aa/" + "a" * 64,
        "sha256/../../outside",
        "/sha256/aa/" + "a" * 64,
        "sha256\\aa\\" + "a" * 64,
        "sha256/aa/" + "b" * 64,
        "sha256/AA/" + "A" * 64,
        "sha256/aa/short",
        "artifacts/sha256/aa/" + "a" * 64,
    ],
)
def test_rejects_noncanonical_or_escaping_storage_keys(
    tmp_path: Path,
    storage_key: str,
) -> None:
    storage = ArtifactStorage(tmp_path / "data")

    with pytest.raises(InvalidStorageKeyError):
        storage.resolve(storage_key)


def test_resolve_rejects_symlink_escape(tmp_path: Path) -> None:
    storage = ArtifactStorage(tmp_path / "data")
    outside = tmp_path / "outside"
    outside.mkdir()
    storage.sha256_root.mkdir(parents=True)
    (storage.sha256_root / "aa").symlink_to(outside, target_is_directory=True)
    storage_key = "sha256/aa/" + "a" * 64

    with pytest.raises(InvalidStorageKeyError, match="outside"):
        storage.resolve(storage_key)
