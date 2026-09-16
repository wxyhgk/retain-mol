# Vendored Ketcher packages

Third-party 2D sketcher, vendored so CI and fresh clones build without any
directory outside this repo. Apache-2.0, see `LICENSE` and `NOTICE`
(EPAM Systems, from the upstream Ketcher project).

## Provenance

Copied from the `retainmol-adaptation` branch of the local ketcher-retainmol
checkout (a fork of https://github.com/epam/ketcher.git with RetainMol
integration changes). Only these packages are vendored (the ones the app
actually resolves, including transitive custom packages):

- ketcher-core, ketcher-react, ketcher-standalone, ketcher-macromolecules
- molecule-contracts, molecule-ketcher, molecule-engine

`node_modules` were NOT copied; `dist/` (built output, git-ignored upstream)
IS committed here on purpose — rebuilding requires the rollup/WASM toolchain
and is slow, while the fork changes rarely.

## Intra-dependency wiring

Cross-links between these packages are relative `file:../<name>` specs
(resolved inside this repo), never registry versions or sibling directories.
`raphael` comes from the root install via ketcher-core's regular dependency.

## Re-vendoring after fork changes

```bash
# 1. rebuild the changed packages inside ketcher-retainmol
# 2. re-copy (excluding node_modules):
tar --exclude='node_modules' -cf - <pkg> | tar -xf - -C third-party/ketcher/
# 3. verify intra-deps are still relative file: specs (see above)
# 4. npm install && npm run build:packages && npm run dev --workspace retainmol
```

Consumers: `apps/retainmol/package.json` (`file:../../third-party/ketcher/*`),
`apps/retainmol/vite.config.ts` (raphael alias, fs.allow),
`apps/retainmol/scripts/copy-ketcher-resources.mjs` (ketcher-react/dist).
