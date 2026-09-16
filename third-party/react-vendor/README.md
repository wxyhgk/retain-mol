# Vendored CJS-as-ESM wrappers (dev only)

Committed, deterministic ESM builds of CJS packages that browsers cannot
consume raw. Regenerate with `node third-party/react-vendor/build.mjs`
(also after every dependency upgrade; it fails loudly on shape changes).

## Why this exists

Two independent gaps, same symptom (named import resolves to `undefined`
or `SyntaxError: ... does not provide an export named ...`):

1. **React family** (`react`, `react-dom`, `react-dom/client`,
   `react/jsx-runtime`, `react/jsx-dev-runtime`): the dev CJS hides every
   `exports.X =` inside `"production" !== process.env.NODE_ENV &&
   (function(){...})()`, opaque to static analysis. The dev optimizer
   therefore emits default-only output; `StrictMode` etc. come back
   `undefined` and React unmounts the whole tree silently.
2. **CJS transitive deps of excluded, source-served chains**
   (`subscription`, via ketcher → codemirror): when the importer lives in
   `node_modules`, the optimizer skips the import and serves the raw CJS
   file as ESM, which exposes no named exports.

## How the wrappers work

No bundler: `prelude + original source + named-export footer`.

- `require("x")` → sibling import (bare specifiers like `react`, so all
  consumers share the optimizer's chunk — never a second copy).
- The CJS body runs inside `function __init(module, exports)`, so its
  `exports.X =` patterns are function-scoped and invisible to
  cjs-module-lexer (verified: the lexer reports these files as ESM).
  Bundlers then keep the named exports instead of collapsing to
  default-only interop.
- Export names are ground truth from Node `require()`; the script asserts
  presence and `typeof` on every run.

## Dev-only cache caveat

Optimized chunks are served `immutable`; the optimizer's version hash does
not cover these files. After regenerating, hard-reload the browser
(or `rm -rf apps/retainmol/node_modules/.vite`) or you will keep testing
the stale chunk.

Production builds (`plugin-commonjs`) are unaffected; the aliases that
point here are dev-only (see `apps/retainmol/vite.config.ts`).
