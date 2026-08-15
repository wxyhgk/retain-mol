"""Bounded file I/O for trusted relation-trace conversion."""

from __future__ import annotations

import json
import os
import secrets
import stat
from decimal import Decimal
from pathlib import Path
from collections.abc import Iterable
from typing import Any

from json_to_lean import reject_constant, reject_duplicate_keys


MAX_TRACE_BYTES = 16 * 1024 * 1024
MAX_SAFE_INTEGER = (1 << 53) - 1


def _parse_integer(token: str) -> int:
    if token == "-0":
        raise ValueError("negative zero is forbidden")
    value = int(token)
    if abs(value) > MAX_SAFE_INTEGER:
        raise ValueError("integer exceeds the JavaScript safe range")
    return value


def read_bounded_regular_file(
    path: Path,
    *,
    label: str = "relation trace",
    maximum: int = MAX_TRACE_BYTES,
) -> bytes:
    descriptor = os.open(path, os.O_RDONLY | os.O_NONBLOCK)
    try:
        metadata = os.fstat(descriptor)
        if not stat.S_ISREG(metadata.st_mode):
            raise ValueError(f"{label} input must be a regular file")
        if metadata.st_size > maximum:
            raise ValueError(f"{label} exceeds {maximum} bytes")
        chunks: list[bytes] = []
        total = 0
        while total <= maximum:
            chunk = os.read(descriptor, min(64 * 1024, maximum + 1 - total))
            if not chunk:
                break
            chunks.append(chunk)
            total += len(chunk)
        if total > maximum:
            raise ValueError(f"{label} exceeds {maximum} bytes")
        return b"".join(chunks)
    finally:
        os.close(descriptor)


def parse_strict_json_bytes(content: bytes, *, label: str) -> Any:
    if content.startswith(b"\xef\xbb\xbf"):
        raise ValueError(f"{label} must not start with a UTF-8 BOM")
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError as error:
        raise ValueError(f"{label} must be valid UTF-8") from error
    return json.loads(
        text,
        object_pairs_hook=reject_duplicate_keys,
        parse_int=_parse_integer,
        parse_float=Decimal,
        parse_constant=reject_constant,
    )


def load_trace_document(path: Path) -> tuple[bytes, Any]:
    content = read_bounded_regular_file(path)
    return content, parse_strict_json_bytes(content, label="relation trace")


def load_trace_payload(path: Path) -> Any:
    return load_trace_document(path)[1]


def _assert_output_not_inputs(input_paths: Iterable[Path], output_path: Path) -> None:
    try:
        output_metadata = os.stat(output_path)
    except FileNotFoundError:
        return
    for input_path in input_paths:
        input_metadata = os.stat(input_path)
        if os.path.samestat(input_metadata, output_metadata):
            raise ValueError("output must not overwrite or alias a certificate input")


def write_trace_output(
    input_paths: Path | Iterable[Path],
    output_path: Path,
    content: str,
) -> None:
    encoded = content.encode("utf-8")
    if len(encoded) > MAX_TRACE_BYTES:
        raise ValueError(f"generated Lean output exceeds {MAX_TRACE_BYTES} bytes")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    resolved_inputs = [input_paths] if isinstance(input_paths, Path) else list(input_paths)
    _assert_output_not_inputs(resolved_inputs, output_path)
    temporary_path = output_path.parent / (
        f".{output_path.name}.{os.getpid()}.{secrets.token_hex(8)}.tmp"
    )
    descriptor: int | None = None
    try:
        descriptor = os.open(
            temporary_path,
            os.O_WRONLY | os.O_CREAT | os.O_EXCL,
            0o600,
        )
        offset = 0
        while offset < len(encoded):
            offset += os.write(descriptor, encoded[offset:])
        os.fsync(descriptor)
        os.close(descriptor)
        descriptor = None
        os.replace(temporary_path, output_path)
    finally:
        if descriptor is not None:
            os.close(descriptor)
        try:
            temporary_path.unlink()
        except FileNotFoundError:
            pass
