"""Bounded file I/O for trusted relation-trace conversion."""

from __future__ import annotations

import json
import os
import secrets
import stat
from decimal import Decimal
from pathlib import Path
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


def _read_bounded_regular_file(path: Path) -> bytes:
    descriptor = os.open(path, os.O_RDONLY | os.O_NONBLOCK)
    try:
        metadata = os.fstat(descriptor)
        if not stat.S_ISREG(metadata.st_mode):
            raise ValueError("relation trace input must be a regular file")
        if metadata.st_size > MAX_TRACE_BYTES:
            raise ValueError(f"relation trace exceeds {MAX_TRACE_BYTES} bytes")
        chunks: list[bytes] = []
        total = 0
        while total <= MAX_TRACE_BYTES:
            chunk = os.read(descriptor, min(64 * 1024, MAX_TRACE_BYTES + 1 - total))
            if not chunk:
                break
            chunks.append(chunk)
            total += len(chunk)
        if total > MAX_TRACE_BYTES:
            raise ValueError(f"relation trace exceeds {MAX_TRACE_BYTES} bytes")
        return b"".join(chunks)
    finally:
        os.close(descriptor)


def load_trace_payload(path: Path) -> Any:
    try:
        text = _read_bounded_regular_file(path).decode("utf-8")
    except UnicodeDecodeError as error:
        raise ValueError("relation trace must be valid UTF-8") from error
    return json.loads(
        text,
        object_pairs_hook=reject_duplicate_keys,
        parse_int=_parse_integer,
        parse_float=Decimal,
        parse_constant=reject_constant,
    )


def _assert_output_not_input(input_path: Path, output_path: Path) -> None:
    try:
        output_metadata = os.stat(output_path)
    except FileNotFoundError:
        return
    input_metadata = os.stat(input_path)
    if os.path.samestat(input_metadata, output_metadata):
        raise ValueError("output must not overwrite or alias the input trace")


def write_trace_output(input_path: Path, output_path: Path, content: str) -> None:
    encoded = content.encode("utf-8")
    if len(encoded) > MAX_TRACE_BYTES:
        raise ValueError(f"generated Lean output exceeds {MAX_TRACE_BYTES} bytes")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    _assert_output_not_input(input_path, output_path)
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

