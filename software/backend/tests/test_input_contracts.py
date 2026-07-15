"""Tests for engine-neutral calculation input-port contracts."""

from __future__ import annotations

import unittest

from software.backend.jobs.input_contracts import (
    CalculationInputContract,
    InputContractRegistry,
    InputPortContract,
    UnknownCalculationKindError,
    validate_calculation_inputs,
)


class InputContractsTests(unittest.TestCase):
    def test_xtb_optimization_accepts_literal_molecule_or_structure(self) -> None:
        for value_format in ("molecule", "structure"):
            with self.subTest(value_format=value_format):
                result = validate_calculation_inputs(
                    "xtb-optimization",
                    {
                        "structure": {
                            "sourceKind": "literal",
                            "format": value_format,
                        }
                    },
                )

                self.assertTrue(result.is_valid)
                self.assertEqual(result.issues, ())

    def test_xtb_optimization_accepts_supported_artifact_formats(self) -> None:
        for value_format in ("retainmol-json", "xyz", "sdf", "mol"):
            with self.subTest(value_format=value_format):
                result = validate_calculation_inputs(
                    "xtb-optimization",
                    {
                        "structure": {
                            "sourceKind": "artifact",
                            "format": value_format,
                        }
                    },
                )

                self.assertTrue(result.is_valid)

    def test_reports_missing_required_port(self) -> None:
        result = validate_calculation_inputs("xtb-optimization", {})

        self.assertFalse(result.is_valid)
        self.assertEqual(result.issues[0].code, "missing_required_port")
        self.assertEqual(result.issues[0].port, "structure")

    def test_reports_format_mismatch_for_molecule_revision(self) -> None:
        result = validate_calculation_inputs(
            "xtb-optimization",
            {"structure": {"sourceKind": "molecule_revision", "format": "xyz"}},
        )

        issue = result.issues[0]
        self.assertEqual(issue.code, "format_mismatch")
        self.assertEqual(issue.actual, "xyz")
        self.assertEqual(issue.allowed, ("molecule",))

    def test_reports_unknown_input_port(self) -> None:
        result = validate_calculation_inputs(
            "xtb-optimization",
            {
                "structure": {"sourceKind": "literal", "format": "molecule"},
                "surprise": {"sourceKind": "literal", "format": "structure"},
            },
        )

        self.assertEqual(result.issues[0].code, "unknown_port")
        self.assertEqual(result.issues[0].port, "surprise")

    def test_reports_format_mismatch_for_the_selected_source_kind(self) -> None:
        result = validate_calculation_inputs(
            "xtb-optimization",
            {"structure": {"sourceKind": "artifact", "format": "cube"}},
        )

        issue = result.issues[0]
        self.assertEqual(issue.code, "format_mismatch")
        self.assertEqual(issue.actual, "cube")
        self.assertEqual(issue.allowed, ("mol", "retainmol-json", "sdf", "xyz"))

    def test_missing_source_kind_and_format_are_reported_without_crashing(self) -> None:
        missing_source = validate_calculation_inputs(
            "xtb-optimization", {"structure": {}}
        )
        missing_format = validate_calculation_inputs(
            "xtb-optimization",
            {"structure": {"source_kind": "artifact"}},
        )

        self.assertEqual(missing_source.issues[0].code, "source_kind_mismatch")
        self.assertIsNone(missing_source.issues[0].actual)
        self.assertEqual(missing_format.issues[0].code, "format_mismatch")
        self.assertIsNone(missing_format.issues[0].actual)

    def test_unknown_calculation_kind_is_explicit(self) -> None:
        with self.assertRaises(UnknownCalculationKindError):
            validate_calculation_inputs("orca-single-point", {})

    def test_custom_registry_rejects_duplicate_kind_registration(self) -> None:
        contract = CalculationInputContract(
            calculation_kind="custom",
            ports=(
                InputPortContract(
                    name="structure",
                    formats_by_source_kind={"artifact": frozenset({"xyz"})},
                ),
            ),
        )
        registry = InputContractRegistry((contract,))

        with self.assertRaises(ValueError):
            registry.register(contract)


if __name__ == "__main__":
    unittest.main()
