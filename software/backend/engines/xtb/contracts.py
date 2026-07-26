"""Validated input contract shared by every xTB execution surface."""

from __future__ import annotations

from typing import Literal, Self

from pydantic import BaseModel, Field, model_validator


class XtbAtom(BaseModel):
    id: str
    symbol: str
    x: float
    y: float
    z: float


class XtbOptimizationRequest(BaseModel):
    atoms: list[XtbAtom]
    fixed_atom_ids: list[str] = Field(default_factory=list)
    charge: int = 0
    multiplicity: int = 1
    method: Literal["gfn2", "gfn1", "gfnff"] = "gfn2"
    max_steps: int = Field(default=200, ge=1, le=1000)
    optlevel: Literal[
        "crude",
        "sloppy",
        "loose",
        "lax",
        "normal",
        "tight",
        "vtight",
        "extreme",
    ] = "normal"

    @model_validator(mode="after")
    def validate_atom_ids(self) -> Self:
        atom_ids = [atom.id for atom in self.atoms]
        duplicate_atom_ids = _duplicate_ids(atom_ids)
        if duplicate_atom_ids:
            raise ValueError(
                f"atoms 中的 ID 不得重复: {', '.join(duplicate_atom_ids)}"
            )

        duplicate_fixed_ids = _duplicate_ids(self.fixed_atom_ids)
        if duplicate_fixed_ids:
            raise ValueError(
                "fixed_atom_ids 不得重复: " + ", ".join(duplicate_fixed_ids)
            )

        atom_id_set = set(atom_ids)
        unknown_ids = [
            atom_id
            for atom_id in self.fixed_atom_ids
            if atom_id not in atom_id_set
        ]
        if unknown_ids:
            raise ValueError(
                "fixed_atom_ids 包含不存在的原子 ID: " + ", ".join(unknown_ids)
            )

        return self


def _duplicate_ids(ids: list[str]) -> list[str]:
    seen: set[str] = set()
    duplicates: list[str] = []
    for item_id in ids:
        if item_id in seen and item_id not in duplicates:
            duplicates.append(item_id)
        seen.add(item_id)
    return duplicates


__all__ = ["XtbAtom", "XtbOptimizationRequest"]
