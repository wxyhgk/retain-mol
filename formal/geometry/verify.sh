#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# Codex and non-interactive shells do not always source ~/.zprofile. Elan is
# still the source of truth; this only exposes its shims when they are already
# installed for the current user.
if ! command -v lake >/dev/null 2>&1 && [[ -f "$HOME/.elan/env" ]]; then
  # shellcheck disable=SC1091
  source "$HOME/.elan/env"
fi

if ! command -v lake >/dev/null 2>&1; then
  printf '%s\n' \
    'Lean is not available. Install elan from https://lean-lang.org/lean4/doc/setup.html' \
    'and rerun this command; lean-toolchain will select the project version.' >&2
  exit 127
fi

lake build
lake env lean RetainMolGeometry/Examples.lean
python3 -m unittest discover -s tests -p 'test_*.py'

GENERATED=".lake/generated/AnchoredCore.lean"
python3 tools/json_to_lean.py examples/anchored-core.json "$GENERATED"
lake env lean "$GENERATED"

COMMAND_GENERATED=".lake/generated/PrimitiveCommandTrace.lean"
python3 tools/command_trace_to_lean.py examples/primitive-command-trace.json "$COMMAND_GENERATED"
lake env lean "$COMMAND_GENERATED"

INTENT_GENERATED=".lake/generated/PrimitiveIntent.lean"
python3 tools/intent_json_to_lean.py examples/primitive-intent.json "$INTENT_GENERATED"
lake env lean "$INTENT_GENERATED"

RELATION_GENERATED=".lake/generated/QuarterTurnRelation.lean"
python3 tools/relation_json_to_lean.py examples/quarter-turn-relation.json "$RELATION_GENERATED"
lake env lean "$RELATION_GENERATED"

ATOM_PORT_MATE_GENERATED=".lake/generated/AtomPortMateRequest.lean"
python3 tools/atom_port_mate_json_to_lean.py \
  examples/atom-port-mate-request.json "$ATOM_PORT_MATE_GENERATED"
lake env lean "$ATOM_PORT_MATE_GENERATED"
