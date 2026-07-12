#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONDA_BIN="${CONDA_BIN:-$(command -v conda || true)}"

if [[ -z "$CONDA_BIN" ]]; then
  echo "conda 未安装或不在 PATH 中" >&2
  exit 1
fi

if "$CONDA_BIN" env list | awk '{print $1}' | grep -qx retainmol-backend; then
  "$CONDA_BIN" env update -n retainmol-backend -f "$SCRIPT_DIR/environment.yml" --prune
else
  "$CONDA_BIN" env create -f "$SCRIPT_DIR/environment.yml"
fi

"$CONDA_BIN" run -n retainmol-backend xtb --version
