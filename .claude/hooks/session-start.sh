#!/bin/bash
# SessionStart hook — install dependencies so type-checks, linters and tests
# work in Claude Code on the web. Synchronous + idempotent.
set -euo pipefail

# Only run in the remote (web) environment; local machines manage their own deps.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"

echo "[session-start] installing dependencies…"

# 1. Root: the Next.js studio site (eslint, next build, types)
npm --prefix "$ROOT" install --no-audit --no-fund

# 2. Neural Cosmos — client (Vite + R3F) and server (Express + Prisma)
npm --prefix "$ROOT/neural-cosmos/client" install --no-audit --no-fund
npm --prefix "$ROOT/neural-cosmos/server" install --no-audit --no-fund

# Note: opportunity-intel has no npm dependencies (its tests are plain node
# scripts), so there is nothing to install there.

echo "[session-start] dependencies ready."
