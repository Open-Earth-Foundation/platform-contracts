#!/usr/bin/env bash
# Fail if <candidate spec> breaks the frozen v1 public contract.
#
# Usage: scripts/check-openapi.sh <candidate-openapi.json>
#
# Internal paths (POLICY.md) are stripped from both sides first. Additive
# changes pass; removals/renames/type changes fail. Requires `oasdiff` on PATH
# (https://github.com/oasdiff/oasdiff) or Docker.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CANDIDATE="${1:?usage: check-openapi.sh <candidate-openapi.json>}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

node "$ROOT/scripts/strip-internal.mjs" "$ROOT/openapi/v1/citycatalyst-api.json" "$WORK/base.json"
node "$ROOT/scripts/strip-internal.mjs" "$CANDIDATE" "$WORK/revision.json"

if command -v oasdiff >/dev/null 2>&1; then
  oasdiff breaking "$WORK/base.json" "$WORK/revision.json" --fail-on ERR \
    --severity-levels "$ROOT/oasdiff-severity.txt"
else
  cp "$ROOT/oasdiff-severity.txt" "$WORK/"
  docker run --rm -v "$WORK:/specs:ro" tufin/oasdiff:v1.34.1 \
    breaking /specs/base.json /specs/revision.json --fail-on ERR \
    --severity-levels /specs/oasdiff-severity.txt
fi
