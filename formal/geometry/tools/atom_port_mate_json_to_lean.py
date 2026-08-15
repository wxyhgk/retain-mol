#!/usr/bin/env python3
"""Project a digest-bound AtomPortMate registry entry into Lean."""

from __future__ import annotations

import argparse
import hashlib
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from intent_json_to_lean import render_intent_atom, render_intent_bond, render_intent_molecule
from json_to_lean import (
    COORDINATE_SCALE,
    EVALUATION_PREFIX,
    MAX_ATOMS,
    MAX_BONDS,
    checked_int,
    checked_list,
    checked_string,
    lean_inline_list,
    lean_list,
    lean_string,
    load_payload,
    strict_object,
)


SCHEMA_VERSION = 1
REGISTRY_VERSION = 1
PROJECTION_VERSION = "atom-port-mate-registry-v1-to-lean-v1"
SCOPE = "atom-port-mate-v1"
MAX_REGION_ATOMS = 64
SHA256_PATTERN = re.compile(r"[0-9a-f]{64}")
ROOT = Path(__file__).resolve().parents[1]
REGISTRY_ROOT = ROOT / "registry" / "atom-port-mate-v1"


@dataclass(frozen=True)
class RegistryRecord:
    relative_path: str
    sha256: str


# These digests are part of the trusted projector, not caller-provided policy.
POLICY_REGISTRY = {
    "c-sp3-c-single-v1": RegistryRecord(
        "policies/c-sp3-c-single-v1.json",
        "d82b598d50e6ff68dc2b0be042393e13ca090a90ecc32ddb3bf5834d950a8be4",
    ),
}

EVIDENCE_REGISTRY = {
    "c-sp3-c-single-pass-v1": RegistryRecord(
        "evidence/c-sp3-c-single-pass-v1.json",
        "ff8a78b9fb974334ed6cce010762b665bb856117004f13b8b4c8ae7109bb23b5",
    ),
    "c-sp3-c-single-reject-v1": RegistryRecord(
        "evidence/c-sp3-c-single-reject-v1.json",
        "9e02050baa623d739ff934064ae25cf050396608fba32acd13a0a908b9808e86",
    ),
}


def checked_sha256(value: Any, field: str) -> str:
    digest = checked_string(value, field)
    if SHA256_PATTERN.fullmatch(digest) is None:
        raise ValueError(f"{field} must be a lowercase SHA-256 digest")
    return digest


def load_registry_entry(
    entry_id: Any,
    request_sha256: Any,
    field: str,
    registry: dict[str, RegistryRecord],
) -> Any:
    parsed_id = checked_string(entry_id, f"{field}Id")
    if parsed_id not in registry:
        raise ValueError(f"{field}Id is not registered: {parsed_id}")
    record = registry[parsed_id]
    supplied_digest = checked_sha256(request_sha256, f"{field}Sha256")
    if supplied_digest != record.sha256:
        raise ValueError(f"{field} digest mismatch")

    path = REGISTRY_ROOT / record.relative_path
    try:
        actual_digest = hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError as error:
        raise ValueError(f"trusted {field} registry entry is unavailable") from error
    if actual_digest != record.sha256:
        raise ValueError(f"trusted {field} registry digest mismatch")
    return load_payload(path)


def render_string_list(value: Any, field: str, *, maximum: int) -> str:
    values = checked_list(value, field, maximum=maximum)
    return lean_inline_list([
        lean_string(item, f"{field}[{index}]")
        for index, item in enumerate(values)
    ])


def render_distance_bound(value: Any, field: str) -> str:
    bound = strict_object(value, field, {
        "atomId1", "atomId2", "minSquared", "maxSquared",
    })
    minimum = checked_int(bound["minSquared"], f"{field}.minSquared", minimum=0)
    maximum = checked_int(bound["maxSquared"], f"{field}.maxSquared", minimum=0)
    if maximum < minimum:
        raise ValueError(f"{field}.maxSquared must not be less than minSquared")
    return (
        "{ atomId1 := "
        f"{lean_string(bound['atomId1'], f'{field}.atomId1')}, "
        f"atomId2 := {lean_string(bound['atomId2'], f'{field}.atomId2')}, "
        f"minSquared := {minimum}, maxSquared := {maximum} }}"
    )


def render_ratio_band(value: Any, field: str) -> str:
    band = strict_object(value, field, {"loNum", "loDen", "hiNum", "hiDen"})
    lo_num = checked_int(band["loNum"], f"{field}.loNum", minimum=0)
    lo_den = checked_int(band["loDen"], f"{field}.loDen", minimum=1)
    hi_num = checked_int(band["hiNum"], f"{field}.hiNum", minimum=0)
    hi_den = checked_int(band["hiDen"], f"{field}.hiDen", minimum=1)
    if lo_num > lo_den or hi_num > hi_den:
        raise ValueError(f"{field} bounds must lie in [0, 1]")
    if lo_num * hi_den > hi_num * lo_den:
        raise ValueError(f"{field} lower bound must not exceed upper bound")
    return (
        f"{{ loNum := {lo_num}, loDen := {lo_den}, "
        f"hiNum := {hi_num}, hiDen := {hi_den} }}"
    )


def render_direction_alignment(value: Any, field: str) -> str:
    alignment = strict_object(value, field, {
        "referenceOriginAtomId", "referenceTipAtomId",
        "candidateOriginAtomId", "candidateTipAtomId",
        "cosineSign", "signMargin", "cosineSquared",
    })
    cosine_sign = checked_string(alignment["cosineSign"], f"{field}.cosineSign")
    if cosine_sign not in {"negative", "nearZero", "positive"}:
        raise ValueError(f"{field}.cosineSign is not supported")
    return (
        "{ referenceOriginAtomId := "
        f"{lean_string(alignment['referenceOriginAtomId'], f'{field}.referenceOriginAtomId')}, "
        "referenceTipAtomId := "
        f"{lean_string(alignment['referenceTipAtomId'], f'{field}.referenceTipAtomId')}, "
        "candidateOriginAtomId := "
        f"{lean_string(alignment['candidateOriginAtomId'], f'{field}.candidateOriginAtomId')}, "
        "candidateTipAtomId := "
        f"{lean_string(alignment['candidateTipAtomId'], f'{field}.candidateTipAtomId')}, "
        f"cosineSign := .{cosine_sign}, "
        f"signMargin := {checked_int(alignment['signMargin'], f'{field}.signMargin', minimum=0)}, "
        "cosineSquared := "
        f"{render_ratio_band(alignment['cosineSquared'], f'{field}.cosineSquared')} }}"
    )


def render_frame(value: Any, field: str) -> str:
    frame = strict_object(value, field, {
        "originAtomId", "axisAtomId", "radialAtomId",
        "minAxisSquared", "minAreaSquared",
    })
    return (
        "{ originAtomId := "
        f"{lean_string(frame['originAtomId'], f'{field}.originAtomId')}, "
        f"axisAtomId := {lean_string(frame['axisAtomId'], f'{field}.axisAtomId')}, "
        f"radialAtomId := {lean_string(frame['radialAtomId'], f'{field}.radialAtomId')}, "
        f"minAxisSquared := {checked_int(frame['minAxisSquared'], f'{field}.minAxisSquared', minimum=1)}, "
        f"minAreaSquared := {checked_int(frame['minAreaSquared'], f'{field}.minAreaSquared', minimum=1)} }}"
    )


def render_region(value: Any, field: str) -> str:
    region = strict_object(value, field, {
        "atomIds", "frame", "handednessAtomId",
        "maxSquaredDistanceDelta", "minAbsVolume6",
    })
    return (
        "{ atomIds := "
        f"{render_string_list(region['atomIds'], f'{field}.atomIds', maximum=MAX_REGION_ATOMS)}, "
        f"frame := {render_frame(region['frame'], f'{field}.frame')}, "
        "handednessAtomId := "
        f"{lean_string(region['handednessAtomId'], f'{field}.handednessAtomId')}, "
        "maxSquaredDistanceDelta := "
        f"{checked_int(region['maxSquaredDistanceDelta'], f'{field}.maxSquaredDistanceDelta', minimum=0)}, "
        f"minAbsVolume6 := {checked_int(region['minAbsVolume6'], f'{field}.minAbsVolume6', minimum=1)} }}"
    )


def render_policy(value: Any) -> tuple[str, dict[str, Any]]:
    policy = strict_object(value, "policyRegistryEntry", {
        "registryVersion", "policyId", "expectedCommandId",
        "expectedLeavingHydrogenAtomId", "expectedLeavingBondId",
        "guestReference", "guestAttachAtomId", "linkBondOrder",
        "linkDistance", "linkDirection", "guestRegion",
    })
    if checked_int(policy["registryVersion"], "policyRegistryEntry.registryVersion") != REGISTRY_VERSION:
        raise ValueError(f"policy registryVersion must be {REGISTRY_VERSION}")
    if policy["linkBondOrder"] != "single":
        raise ValueError("policyRegistryEntry.linkBondOrder must be single")
    rendered = "\n".join([
        render_intent_molecule("guestReference", policy["guestReference"]),
        "private def policy : AtomPortMatePolicy := {",
        f"  policyId := {lean_string(policy['policyId'], 'policyRegistryEntry.policyId')}",
        "  expectedCommandId := "
        f"{lean_string(policy['expectedCommandId'], 'policyRegistryEntry.expectedCommandId')}",
        "  expectedLeavingHydrogenAtomId := "
        f"{lean_string(policy['expectedLeavingHydrogenAtomId'], 'policyRegistryEntry.expectedLeavingHydrogenAtomId')}",
        "  expectedLeavingBondId := "
        f"{lean_string(policy['expectedLeavingBondId'], 'policyRegistryEntry.expectedLeavingBondId')}",
        "  guestReference := guestReference",
        "  guestAttachAtomId := "
        f"{lean_string(policy['guestAttachAtomId'], 'policyRegistryEntry.guestAttachAtomId')}",
        "  linkBondOrder := .single",
        f"  linkDistance := {render_distance_bound(policy['linkDistance'], 'policyRegistryEntry.linkDistance')}",
        "  linkDirection := "
        f"{render_direction_alignment(policy['linkDirection'], 'policyRegistryEntry.linkDirection')}",
        f"  guestRegion := {render_region(policy['guestRegion'], 'policyRegistryEntry.guestRegion')}",
        "}",
    ])
    return rendered, policy


def render_rewrite(value: Any) -> str:
    rewrite = strict_object(value, "evidenceRegistryEntry.mate.rewrite", {
        "removedAtomIds", "removedBondIds", "addedAtoms", "addedBonds",
    })
    removed_atoms = render_string_list(
        rewrite["removedAtomIds"], "evidenceRegistryEntry.mate.rewrite.removedAtomIds",
        maximum=MAX_ATOMS,
    )
    removed_bonds = render_string_list(
        rewrite["removedBondIds"], "evidenceRegistryEntry.mate.rewrite.removedBondIds",
        maximum=MAX_BONDS,
    )
    added_atoms = checked_list(
        rewrite["addedAtoms"], "evidenceRegistryEntry.mate.rewrite.addedAtoms",
        maximum=MAX_ATOMS,
    )
    added_bonds = checked_list(
        rewrite["addedBonds"], "evidenceRegistryEntry.mate.rewrite.addedBonds",
        maximum=MAX_BONDS,
    )
    return "\n".join([
        "private def rewrite : GraphRewrite := {",
        f"  removedAtomIds := {removed_atoms}",
        f"  removedBondIds := {removed_bonds}",
        "  addedAtoms := " + lean_list([
            render_intent_atom(atom, f"evidenceRegistryEntry.mate.rewrite.addedAtoms[{index}]")
            for index, atom in enumerate(added_atoms)
        ], "    "),
        "  addedBonds := " + lean_list([
            render_intent_bond(bond, f"evidenceRegistryEntry.mate.rewrite.addedBonds[{index}]")
            for index, bond in enumerate(added_bonds)
        ], "    "),
        "}",
    ])


def render_evidence(value: Any) -> tuple[str, dict[str, Any]]:
    evidence = strict_object(value, "evidenceRegistryEntry", {
        "registryVersion", "evidenceId", "policyId", "reference", "candidate", "mate",
    })
    if checked_int(evidence["registryVersion"], "evidenceRegistryEntry.registryVersion") != REGISTRY_VERSION:
        raise ValueError(f"evidence registryVersion must be {REGISTRY_VERSION}")
    mate = strict_object(evidence["mate"], "evidenceRegistryEntry.mate", {
        "commandId", "hostAtomId", "leavingHydrogenAtomId",
        "leavingBondId", "linkBondId", "rewrite",
    })
    rendered = "\n".join([
        render_intent_molecule("reference", evidence["reference"]),
        render_intent_molecule("candidate", evidence["candidate"]),
        render_rewrite(mate["rewrite"]),
        "private def mate : AtomPortMate := {",
        f"  commandId := {lean_string(mate['commandId'], 'evidenceRegistryEntry.mate.commandId')}",
        "  rewrite := rewrite",
        f"  hostAtomId := {lean_string(mate['hostAtomId'], 'evidenceRegistryEntry.mate.hostAtomId')}",
        "  leavingHydrogenAtomId := "
        f"{lean_string(mate['leavingHydrogenAtomId'], 'evidenceRegistryEntry.mate.leavingHydrogenAtomId')}",
        f"  leavingBondId := {lean_string(mate['leavingBondId'], 'evidenceRegistryEntry.mate.leavingBondId')}",
        f"  linkBondId := {lean_string(mate['linkBondId'], 'evidenceRegistryEntry.mate.linkBondId')}",
        "}",
    ])
    return rendered, evidence


def atom_symbol(molecule: dict[str, Any], atom_id: str) -> Any:
    atoms = strict_object(molecule, "molecule", {"atoms", "bonds"})["atoms"]
    for atom in checked_list(atoms, "molecule.atoms", maximum=MAX_ATOMS):
        if isinstance(atom, dict) and atom.get("atomId") == atom_id:
            return atom.get("symbol")
    return None


def validate_supported_profile(policy: dict[str, Any], evidence: dict[str, Any]) -> None:
    policy_id = checked_string(policy["policyId"], "policyRegistryEntry.policyId")
    evidence_policy_id = checked_string(evidence["policyId"], "evidenceRegistryEntry.policyId")
    if evidence_policy_id != policy_id:
        raise ValueError("evidence policyId does not match policy registry entry")
    mate = evidence["mate"]
    if atom_symbol(evidence["reference"], mate["hostAtomId"]) != "C":
        raise ValueError("AtomPortMate V1 only supports a C host atom")
    if atom_symbol(policy["guestReference"], policy["guestAttachAtomId"]) != "C":
        raise ValueError("AtomPortMate V1 only supports a c-sp3 C guest attach atom")


def render_evaluation(request: dict[str, Any]) -> str:
    return "\n".join([
        "private def evaluationIdentity : AtomPortMateEvaluationIdentity := {",
        f"  projectionVersion := {lean_string(PROJECTION_VERSION, 'projectionVersion')}",
        f"  scope := {lean_string(SCOPE, 'scope')}",
        "  commandId := mate.commandId",
        f"  policyId := {lean_string(request['policyId'], 'policyId')}",
        f"  policySha256 := {lean_string(request['policySha256'], 'policySha256')}",
        f"  evidenceId := {lean_string(request['evidenceId'], 'evidenceId')}",
        f"  evidenceSha256 := {lean_string(request['evidenceSha256'], 'evidenceSha256')}",
        "}",
        "",
        "private def evaluationPayload : String :=",
        "  let evaluation := evaluateAtomPortMate evaluationIdentity reference candidate policy mate",
        "  let identity := evaluation.identity",
        "  let status := if evaluation.passed",
        '    then "pass" else "reject"',
        '  "{\\\"status\\\":\\\"" ++ status ++',
        '    "\\\",\\\"scope\\\":\\\"" ++ identity.scope ++',
        '    "\\\",\\\"projectionVersion\\\":\\\"" ++ identity.projectionVersion ++',
        '    "\\\",\\\"commandId\\\":\\\"" ++ identity.commandId ++',
        '    "\\\",\\\"policyId\\\":\\\"" ++ identity.policyId ++',
        '    "\\\",\\\"policySha256\\\":\\\"" ++ identity.policySha256 ++',
        '    "\\\",\\\"evidenceId\\\":\\\"" ++ identity.evidenceId ++',
        '    "\\\",\\\"evidenceSha256\\\":\\\"" ++ identity.evidenceSha256 ++ "\\\"}"',
        "",
        f'#eval IO.println ("{EVALUATION_PREFIX}" ++ evaluationPayload)',
    ])


def render_document(payload: Any) -> str:
    request = strict_object(payload, "document", {
        "schemaVersion", "projectionVersion", "coordinateScale",
        "policyId", "policySha256", "evidenceId", "evidenceSha256",
    })
    if checked_int(request["schemaVersion"], "schemaVersion") != SCHEMA_VERSION:
        raise ValueError(f"schemaVersion must be {SCHEMA_VERSION}")
    if checked_string(request["projectionVersion"], "projectionVersion") != PROJECTION_VERSION:
        raise ValueError(f"projectionVersion must be {PROJECTION_VERSION}")
    if checked_int(request["coordinateScale"], "coordinateScale") != COORDINATE_SCALE:
        raise ValueError(f"coordinateScale must be fixed at {COORDINATE_SCALE}")

    policy_value = load_registry_entry(
        request["policyId"], request["policySha256"], "policy", POLICY_REGISTRY,
    )
    evidence_value = load_registry_entry(
        request["evidenceId"], request["evidenceSha256"], "evidence", EVIDENCE_REGISTRY,
    )
    policy_rendered, policy = render_policy(policy_value)
    evidence_rendered, evidence = render_evidence(evidence_value)
    if policy["policyId"] != request["policyId"]:
        raise ValueError("policy registry identity mismatch")
    if evidence["evidenceId"] != request["evidenceId"]:
        raise ValueError("evidence registry identity mismatch")
    validate_supported_profile(policy, evidence)

    return "\n".join([
        "-- Generated from digest-bound AtomPortMate registry entries. Do not edit by hand.",
        "import RetainMolGeometry",
        "",
        "open RetainMol.Geometry",
        "",
        policy_rendered,
        "",
        evidence_rendered,
        "",
        render_evaluation(request),
        "",
    ])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    rendered = render_document(load_payload(args.input))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8")


if __name__ == "__main__":
    main()
