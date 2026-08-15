from __future__ import annotations

from pathlib import Path
from typing import Callable

from .artifact_contracts import canonical_json_bytes, sha256_file
from .relation_certificate_checker import (
    RelationCertificateCheckResult,
    run_relation_certificate_check,
)
from .relation_certificate_manifest import (
    build_relation_certificate_manifest,
    load_relation_certificate_manifest,
)
from .run_preparation import PreparedRun


def _write_json_atomic(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_bytes(canonical_json_bytes(payload) + b"\n")
    temporary.replace(path)


def _result_payload(result: RelationCertificateCheckResult) -> dict:
    return {
        "schemaVersion": 1,
        "status": result.status,
        "code": result.code,
        "projectionVersion": result.projection_version,
        "manifestSha256": None,
        "evidence": dict(result.evidence) if result.evidence is not None else None,
    }


def certify_relation_execution(
    prepared: PreparedRun,
    *,
    checker: Callable[..., RelationCertificateCheckResult] = run_relation_certificate_check,
) -> dict:
    paths = prepared.paths
    paths.relation_certificate_manifest.unlink(missing_ok=True)
    try:
        result = checker(paths.run_dir)
    except Exception as error:
        return {
            "schemaVersion": 1,
            "status": "indeterminate",
            "code": "relation-check-failed",
            "projectionVersion": None,
            "manifestSha256": None,
            "evidence": {
                "error": f"{type(error).__name__}: {error}",
            },
        }
    payload = _result_payload(result)
    if result.status != "pass":
        return payload
    try:
        manifest = build_relation_certificate_manifest(
            paths.run_dir,
            projection_version=result.projection_version,
        )
        _write_json_atomic(paths.relation_certificate_manifest, manifest)
        load_relation_certificate_manifest(paths.relation_certificate_manifest)
        payload["manifestSha256"] = sha256_file(paths.relation_certificate_manifest)
        return payload
    except Exception as error:
        paths.relation_certificate_manifest.unlink(missing_ok=True)
        return {
            "schemaVersion": 1,
            "status": "indeterminate",
            "code": "relation-certificate-finalization-failed",
            "projectionVersion": result.projection_version,
            "manifestSha256": None,
            "evidence": {
                "error": f"{type(error).__name__}: {error}",
            },
        }
