"""Immutable, content-addressed storage for generated artifacts."""

from __future__ import annotations

import fcntl
import hashlib
import os
import re
import stat
import tempfile
from pathlib import Path
from typing import BinaryIO


_CHUNK_SIZE = 1024 * 1024
_STORAGE_KEY_PATTERN = re.compile(
    r"\Asha256/(?P<prefix>[0-9a-f]{2})/(?P<digest>[0-9a-f]{64})\Z"
)


class InvalidStorageKeyError(ValueError):
    """Raised when a storage key is not a canonical SHA-256 key."""


class ArtifactIntegrityError(RuntimeError):
    """Raised when an existing object violates content-addressed storage rules."""


class ArtifactStorage:
    """Publish immutable artifacts below ``<data_directory>/artifacts``."""

    def __init__(self, data_directory: str | os.PathLike[str]) -> None:
        self.data_directory = Path(data_directory)
        self.root = self.data_directory / "artifacts"
        self.sha256_root = self.root / "sha256"

    def publish(
        self,
        source: str | os.PathLike[str] | bytes | bytearray | memoryview | BinaryIO,
    ) -> dict[str, str | int]:
        """Copy ``source`` into the store and return its content identity."""

        if isinstance(source, (bytes, bytearray, memoryview)):
            return self.publish_bytes(bytes(source))
        if isinstance(source, (str, os.PathLike)):
            return self.publish_file(source)
        if not hasattr(source, "read"):
            raise TypeError("source must be a path, bytes, or a binary file object")
        return self._publish_stream(source)

    def publish_file(
        self,
        source_path: str | os.PathLike[str],
    ) -> dict[str, str | int]:
        """Publish the bytes currently stored in ``source_path``."""

        with Path(source_path).open("rb") as source:
            return self._publish_stream(source)

    def publish_bytes(
        self,
        content: bytes | bytearray | memoryview,
    ) -> dict[str, str | int]:
        """Publish an in-memory byte sequence."""

        from io import BytesIO

        return self._publish_stream(BytesIO(bytes(content)))

    def resolve(self, storage_key: str) -> Path:
        """Resolve a canonical storage key without allowing path traversal."""

        prefix, digest = self._parse_storage_key(storage_key)
        candidate = self.sha256_root / prefix / digest
        root = self.sha256_root.resolve(strict=False)
        resolved = candidate.resolve(strict=False)
        try:
            resolved.relative_to(root)
        except ValueError as exc:
            raise InvalidStorageKeyError("storage key resolves outside artifact storage") from exc
        return resolved

    def resolve_path(self, storage_key: str) -> Path:
        """Alias for callers that prefer an explicit path-oriented method name."""

        return self.resolve(storage_key)

    def _publish_stream(self, source: BinaryIO) -> dict[str, str | int]:
        self.sha256_root.mkdir(parents=True, exist_ok=True)
        digest = hashlib.sha256()
        byte_size = 0
        temporary_path: Path | None = None

        try:
            with tempfile.NamedTemporaryFile(
                mode="wb",
                prefix=".artifact-",
                dir=self.sha256_root,
                delete=False,
            ) as temporary:
                temporary_path = Path(temporary.name)
                while True:
                    chunk = source.read(_CHUNK_SIZE)
                    if not chunk:
                        break
                    if not isinstance(chunk, bytes):
                        raise TypeError("artifact streams must return bytes")
                    temporary.write(chunk)
                    digest.update(chunk)
                    byte_size += len(chunk)
                temporary.flush()
                os.fsync(temporary.fileno())

            sha256 = digest.hexdigest()
            storage_key = f"sha256/{sha256[:2]}/{sha256}"
            destination = self.resolve(storage_key)
            destination.parent.mkdir(parents=True, exist_ok=True)
            self._publish_without_overwrite(temporary_path, destination, sha256, byte_size)
            temporary_path = None
            return {
                "storageKey": storage_key,
                "sha256": sha256,
                "byteSize": byte_size,
            }
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)

    def _publish_without_overwrite(
        self,
        temporary_path: Path,
        destination: Path,
        expected_sha256: str,
        expected_size: int,
    ) -> None:
        directory_fd = os.open(destination.parent, os.O_RDONLY)
        try:
            fcntl.flock(directory_fd, fcntl.LOCK_EX)
            if os.path.lexists(destination):
                self._verify_existing(destination, expected_sha256, expected_size)
                temporary_path.unlink()
                return
            os.rename(temporary_path, destination)
            self._fsync_directory(directory_fd)
        finally:
            fcntl.flock(directory_fd, fcntl.LOCK_UN)
            os.close(directory_fd)

    @staticmethod
    def _verify_existing(path: Path, expected_sha256: str, expected_size: int) -> None:
        file_stat = path.lstat()
        if not stat.S_ISREG(file_stat.st_mode) or file_stat.st_size != expected_size:
            raise ArtifactIntegrityError(f"refusing to overwrite existing artifact: {path}")

        digest = hashlib.sha256()
        with path.open("rb") as existing:
            for chunk in iter(lambda: existing.read(_CHUNK_SIZE), b""):
                digest.update(chunk)
        if digest.hexdigest() != expected_sha256:
            raise ArtifactIntegrityError(f"refusing to overwrite existing artifact: {path}")

    @staticmethod
    def _parse_storage_key(storage_key: str) -> tuple[str, str]:
        if not isinstance(storage_key, str):
            raise InvalidStorageKeyError("storage key must be a string")
        match = _STORAGE_KEY_PATTERN.fullmatch(storage_key)
        if match is None or match["prefix"] != match["digest"][:2]:
            raise InvalidStorageKeyError("invalid SHA-256 storage key")
        return match["prefix"], match["digest"]

    @staticmethod
    def _fsync_directory(directory_fd: int) -> None:
        try:
            os.fsync(directory_fd)
        except OSError:
            # Some filesystems do not support syncing directory descriptors.
            pass
