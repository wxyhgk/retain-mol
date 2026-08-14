#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

lake build
lake env lean RetainMolGeometry/Examples.lean
python3 -m unittest discover -s tests -p 'test_*.py'

GENERATED=".lake/generated/AnchoredCore.lean"
python3 tools/json_to_lean.py examples/anchored-core.json "$GENERATED"
lake env lean "$GENERATED"
