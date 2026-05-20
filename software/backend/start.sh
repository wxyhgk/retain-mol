#!/bin/bash
CONDA_ENV=/opt/homebrew/Caskroom/miniconda/base/envs/retainmol-backend
export PATH="$CONDA_ENV/bin:$PATH"
cd "$(dirname "$0")"
exec "$CONDA_ENV/bin/uvicorn" main:app --port 8000 --reload "$@"
