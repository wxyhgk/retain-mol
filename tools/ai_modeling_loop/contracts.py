from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


SCHEMA_VERSION = 1
REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST_DIR = REPO_ROOT / "data" / "retainmol_ai_edit" / "manifests"
DEFAULT_WORK_DIR = REPO_ROOT / ".retainmol-loop"
DEFAULT_HISTORY_DIR = REPO_ROOT / "data" / "retainmol_ai_edit" / "loop_history"


@dataclass(frozen=True)
class Position:
    x: float
    y: float
    z: float

    @classmethod
    def from_json(cls, value: dict[str, Any]) -> "Position":
        return cls(*(float(value[key]) for key in ("x", "y", "z")))

    def to_json(self) -> dict[str, float]:
        return {"x": self.x, "y": self.y, "z": self.z}


@dataclass(frozen=True)
class Anchor:
    anchor_id: str
    atom_index: int
    symbol: str
    position: Position

    @classmethod
    def from_json(cls, value: dict[str, Any]) -> "Anchor":
        return cls(
            anchor_id=str(value["id"]),
            atom_index=int(value["referenceAtomIndex"]),
            symbol=str(value["symbol"]),
            position=Position.from_json(value["position"]),
        )

    def public_json(self) -> dict[str, Any]:
        return {
            "id": self.anchor_id,
            "symbol": self.symbol,
            "position": self.position.to_json(),
            "fixed": True,
        }


@dataclass(frozen=True)
class BenchmarkCase:
    case_id: str
    image: Path
    reference_sdf: Path
    charge: int
    multiplicity: int
    anchors: tuple[Anchor, ...]
    description: str

    @classmethod
    def from_json(cls, value: dict[str, Any], manifest_path: Path) -> "BenchmarkCase":
        if int(value.get("schemaVersion", -1)) != SCHEMA_VERSION:
            raise ValueError(f"Unsupported benchmark schema: {value.get('schemaVersion')}")
        root = REPO_ROOT
        image = (root / str(value["inputs"]["image"])).resolve()
        sdf = (root / str(value["hiddenReference"]["sdf"])).resolve()
        anchors = tuple(Anchor.from_json(item) for item in value["anchors"])
        if len({anchor.anchor_id for anchor in anchors}) != len(anchors):
            raise ValueError(f"Duplicate anchor id in {manifest_path}")
        return cls(
            case_id=str(value["caseId"]),
            image=image,
            reference_sdf=sdf,
            charge=int(value.get("charge", 0)),
            multiplicity=int(value.get("multiplicity", 1)),
            anchors=anchors,
            description=str(value.get("description", "")),
        )


def load_case(case_id: str, manifest_dir: Path = DEFAULT_MANIFEST_DIR) -> BenchmarkCase:
    path = manifest_dir / f"{case_id}.json"
    if not path.exists():
        available = ", ".join(item.stem for item in sorted(manifest_dir.glob("*.json")))
        raise FileNotFoundError(f"Unknown case {case_id!r}; available: {available or 'none'}")
    return BenchmarkCase.from_json(json.loads(path.read_text()), path)


def list_cases(manifest_dir: Path = DEFAULT_MANIFEST_DIR) -> tuple[BenchmarkCase, ...]:
    return tuple(load_case(path.stem, manifest_dir) for path in sorted(manifest_dir.glob("*.json")))
