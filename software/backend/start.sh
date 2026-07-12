#!/usr/bin/env bash
set -euo pipefail

CONDA_BIN="${CONDA_BIN:-$(command -v conda || true)}"
if [[ -z "$CONDA_BIN" ]]; then
  echo "conda 未安装；请先运行 ./setup.sh" >&2
  exit 1
fi

cd "$(dirname "$0")"
exec "$CONDA_BIN" run --no-capture-output -n retainmol-backend \
  uvicorn main:app --port "${PORT:-8000}" --reload "$@"
