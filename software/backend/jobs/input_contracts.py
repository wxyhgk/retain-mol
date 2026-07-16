"""Engine-neutral input-port contracts for calculation jobs.

The contract layer describes what a calculation kind consumes without knowing
about HTTP request models, persistence, or a particular execution engine.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Iterable, Mapping


@dataclass(frozen=True)
class InputPortContract:
    """Accepted source kinds and formats for one named calculation input."""

    name: str
    required: bool = True
    formats_by_source_kind: Mapping[str, frozenset[str]] = field(default_factory=dict)

    def __post_init__(self) -> None:
        normalized = {
            source_kind.strip().lower(): frozenset(
                value.strip().lower() for value in formats
            )
            for source_kind, formats in self.formats_by_source_kind.items()
        }
        object.__setattr__(self, "formats_by_source_kind", normalized)

    @property
    def allowed_source_kinds(self) -> frozenset[str]:
        return frozenset(self.formats_by_source_kind)


@dataclass(frozen=True)
class CalculationInputContract:
    """Input-port declaration for one calculation kind."""

    calculation_kind: str
    ports: tuple[InputPortContract, ...]

    def __post_init__(self) -> None:
        names = [port.name for port in self.ports]
        if len(names) != len(set(names)):
            raise ValueError(f"Duplicate input port in {self.calculation_kind!r}")


@dataclass(frozen=True)
class InputContractIssue:
    """One machine-readable input-contract violation."""

    code: str
    port: str
    message: str
    actual: str | None = None
    allowed: tuple[str, ...] = ()


@dataclass(frozen=True)
class InputContractValidation:
    """Result returned by contract validation."""

    calculation_kind: str
    issues: tuple[InputContractIssue, ...] = ()

    @property
    def is_valid(self) -> bool:
        return not self.issues


class UnknownCalculationKindError(LookupError):
    """Raised when no input contract is registered for a calculation kind."""


class InputContractRegistry:
    """Small registry for calculation input declarations and validation."""

    def __init__(self, contracts: Iterable[CalculationInputContract] = ()) -> None:
        self._contracts: dict[str, CalculationInputContract] = {}
        for contract in contracts:
            self.register(contract)

    def register(self, contract: CalculationInputContract) -> None:
        kind = _normalize_required_text(contract.calculation_kind, "calculation kind")
        if kind in self._contracts:
            raise ValueError(f"Input contract already registered for {kind!r}")
        self._contracts[kind] = contract

    def get(self, calculation_kind: str) -> CalculationInputContract:
        kind = _normalize_required_text(calculation_kind, "calculation kind")
        try:
            return self._contracts[kind]
        except KeyError as error:
            raise UnknownCalculationKindError(
                f"No input contract registered for {kind!r}"
            ) from error

    def validate(
        self,
        calculation_kind: str,
        inputs: Mapping[str, Any],
    ) -> InputContractValidation:
        contract = self.get(calculation_kind)
        issues: list[InputContractIssue] = []
        known_ports = {port.name for port in contract.ports}

        for input_name in inputs:
            if input_name not in known_ports:
                issues.append(
                    InputContractIssue(
                        code="unknown_port",
                        port=input_name,
                        message=f"Input port {input_name!r} is not declared by {contract.calculation_kind!r}",
                    )
                )

        for port in contract.ports:
            binding = inputs.get(port.name)
            if binding is None:
                if port.required:
                    issues.append(
                        InputContractIssue(
                            code="missing_required_port",
                            port=port.name,
                            message=f"Required input port {port.name!r} is missing",
                        )
                    )
                continue

            source_kind = _read_binding_value(binding, "sourceKind", "source_kind")
            normalized_source_kind = _normalize_optional_text(source_kind)
            if normalized_source_kind not in port.allowed_source_kinds:
                allowed = tuple(sorted(port.allowed_source_kinds))
                issues.append(
                    InputContractIssue(
                        code="source_kind_mismatch",
                        port=port.name,
                        message=(
                            f"Input port {port.name!r} does not accept source kind "
                            f"{normalized_source_kind!r}"
                        ),
                        actual=normalized_source_kind,
                        allowed=allowed,
                    )
                )
                continue

            value_format = _normalize_optional_text(
                _read_binding_value(binding, "format")
            )
            allowed_formats = port.formats_by_source_kind[normalized_source_kind]
            if value_format not in allowed_formats:
                allowed = tuple(sorted(allowed_formats))
                issues.append(
                    InputContractIssue(
                        code="format_mismatch",
                        port=port.name,
                        message=(
                            f"Input port {port.name!r} does not accept format "
                            f"{value_format!r} from source kind "
                            f"{normalized_source_kind!r}"
                        ),
                        actual=value_format,
                        allowed=allowed,
                    )
                )

        return InputContractValidation(
            calculation_kind=contract.calculation_kind,
            issues=tuple(issues),
        )


def _read_binding_value(binding: Any, *names: str) -> Any:
    if isinstance(binding, Mapping):
        for name in names:
            if name in binding:
                return binding[name]
        return None
    for name in names:
        if hasattr(binding, name):
            return getattr(binding, name)
    return None


def _normalize_required_text(value: str, label: str) -> str:
    normalized = _normalize_optional_text(value)
    if normalized is None:
        raise ValueError(f"{label} must not be empty")
    return normalized


def _normalize_optional_text(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    normalized = value.strip().lower()
    return normalized or None


XTB_OPTIMIZATION_INPUT_CONTRACT = CalculationInputContract(
    calculation_kind="xtb-optimization",
    ports=(
        InputPortContract(
            name="structure",
            formats_by_source_kind={
                "literal": frozenset({"molecule", "structure"}),
                "molecule_revision": frozenset({"molecule"}),
                "artifact": frozenset({"retainmol-json", "xyz", "sdf", "mol"}),
            },
        ),
    ),
)

TS_INITIAL_GUESS_INPUT_CONTRACT = CalculationInputContract(
    calculation_kind="ts-initial-guess",
    ports=(
        InputPortContract(
            name="reactant",
            formats_by_source_kind={
                "artifact": frozenset({"retainmol-json", "xyz", "sdf", "mol"}),
            },
        ),
        InputPortContract(
            name="product",
            formats_by_source_kind={
                "artifact": frozenset({"retainmol-json", "xyz", "sdf", "mol"}),
            },
        ),
    ),
)


def _psi4_structure_contract(calculation_kind: str) -> CalculationInputContract:
    return CalculationInputContract(
        calculation_kind=calculation_kind,
        ports=(
            InputPortContract(
                name="structure",
                formats_by_source_kind={
                    "literal": frozenset({"molecule", "structure"}),
                    "molecule_revision": frozenset({"molecule"}),
                    "artifact": frozenset({"retainmol-json", "xyz"}),
                },
            ),
        ),
    )


PSI4_TS_REFINE_INPUT_CONTRACT = _psi4_structure_contract("psi4-ts-refine")
PSI4_FREQUENCY_INPUT_CONTRACT = _psi4_structure_contract("psi4-frequency")
PSI4_IRC_INPUT_CONTRACT = _psi4_structure_contract("psi4-irc")


DEFAULT_INPUT_CONTRACTS = InputContractRegistry(
    (
        XTB_OPTIMIZATION_INPUT_CONTRACT,
        TS_INITIAL_GUESS_INPUT_CONTRACT,
        PSI4_TS_REFINE_INPUT_CONTRACT,
        PSI4_FREQUENCY_INPUT_CONTRACT,
        PSI4_IRC_INPUT_CONTRACT,
    )
)


def validate_calculation_inputs(
    calculation_kind: str,
    inputs: Mapping[str, Any],
) -> InputContractValidation:
    """Validate inputs with the process-wide built-in contract registry."""

    return DEFAULT_INPUT_CONTRACTS.validate(calculation_kind, inputs)


__all__ = [
    "CalculationInputContract",
    "DEFAULT_INPUT_CONTRACTS",
    "InputContractIssue",
    "InputContractRegistry",
    "InputContractValidation",
    "InputPortContract",
    "UnknownCalculationKindError",
    "PSI4_FREQUENCY_INPUT_CONTRACT",
    "PSI4_IRC_INPUT_CONTRACT",
    "PSI4_TS_REFINE_INPUT_CONTRACT",
    "TS_INITIAL_GUESS_INPUT_CONTRACT",
    "XTB_OPTIMIZATION_INPUT_CONTRACT",
    "validate_calculation_inputs",
]
