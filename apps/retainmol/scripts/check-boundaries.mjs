import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, normalize, relative, resolve } from 'node:path'

const SRC_DIR = new URL('../src', import.meta.url).pathname
const MOL_VIEWER_SRC_DIR = new URL('../../../packages/mol-viewer/src', import.meta.url).pathname
const MOL_VIEWER_COMMANDS_DIR = join(MOL_VIEWER_SRC_DIR, 'lib/builder/commands')
const allowedMolViewerImports = new Set([
  '@retainmol/mol-viewer/core',
  '@retainmol/mol-viewer/fragments',
  '@retainmol/mol-viewer/io',
  '@retainmol/mol-viewer/optimize',
  '@retainmol/mol-viewer/pubchem',
  '@retainmol/mol-viewer/samples',
  '@retainmol/mol-viewer/styles',
  '@retainmol/mol-viewer/templates',
  '@retainmol/mol-viewer/viewer',
])

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) out.push(...walk(path))
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) out.push(path)
  }
  return out
}

function walkIncludingTests(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) out.push(...walkIncludingTests(path))
    else if (/\.(ts|tsx)$/.test(entry)) out.push(path)
  }
  return out
}

function collectModuleSpecifiers(source) {
  const specifiers = []
  const patterns = [
    /\bimport(?:\s+type)?[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bexport(?:\s+type)?[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/g,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(source))) specifiers.push(match[1])
  }
  return specifiers
}

function resolveRelativeSpecifier(file, specifier) {
  if (!specifier.startsWith('.')) return null
  return normalize(resolve(dirname(file), specifier))
}

const violations = []

for (const file of walk(SRC_DIR)) {
  const rel = relative(SRC_DIR, file)
  const source = readFileSync(file, 'utf8')
  const imports = collectModuleSpecifiers(source)

  for (const specifier of imports) {
    if (specifier.startsWith('@retainmol@')) {
      violations.push(`${rel}: malformed package import "${specifier}"`)
    }

    if (specifier === '@retainmol/mol-viewer') {
      violations.push(`${rel}: use an explicit @retainmol/mol-viewer/* subpath instead of the root barrel`)
      continue
    }

    if (specifier.startsWith('@retainmol/mol-viewer/') && !allowedMolViewerImports.has(specifier)) {
      violations.push(`${rel}: unsupported mol-viewer subpath "${specifier}"`)
    }

    if (specifier === '@retainmol/mol-viewer/viewer' && rel !== 'domain/viewerAdapter.ts') {
      violations.push(`${rel}: import viewer runtime through "@/domain/viewerAdapter"`)
    }

    if (rel.startsWith('components/ui/') && specifier.startsWith('@retainmol/mol-viewer')) {
      violations.push(`${rel}: shared UI primitives must not depend on mol-viewer`)
    }

    if (rel.startsWith('features/') && /\bbondSelectedAtoms\s*\(/.test(source)) {
      violations.push(`${rel}: call a domain edit command instead of invoking bondSelectedAtoms from UI`)
    }

    if (specifier.includes('/lib/builder/editing') || specifier.includes('/src/lib/builder/editing')) {
      violations.push(`${rel}: app code must use mol-viewer public APIs, not builder editing internals`)
    }
  }
}

const appDomainDirectEditAllowed = new Set([
  'domain/appEditEffects.ts',
])

for (const file of walk(join(SRC_DIR, 'domain'))) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
  if (appDomainDirectEditAllowed.has(rel)) continue
  const source = readFileSync(file, 'utf8')
  if (/useMoleculeStore\.getState\(\)\.(selectAtoms|bondSelectedAtoms|setObjectAtomPositions)\s*\(/.test(source)) {
    violations.push(`${rel}: route app edit store writes through domain/appEditEffects`)
  }
}

for (const file of walk(MOL_VIEWER_COMMANDS_DIR)) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file)
  const source = readFileSync(file, 'utf8')
  const imports = collectModuleSpecifiers(source)

  for (const specifier of imports) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedSpecifier = specifier.replaceAll('\\', '/')
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''

    if (normalizedSpecifier === 'react' || normalizedSpecifier.startsWith('react/')) {
      violations.push(`${rel}: builder commands must not import React`)
    }

    if (
      normalizedResolved.startsWith('store/') ||
      normalizedResolved.startsWith('components/') ||
      normalizedResolved.startsWith('hooks/') ||
      normalizedResolved.startsWith('lib/molRenderer/')
    ) {
      violations.push(`${rel}: builder commands must not import "${normalizedResolved}"`)
    }

    if (normalizedSpecifier.startsWith('@/') || normalizedSpecifier.startsWith('@retainmol/')) {
      violations.push(`${rel}: builder commands must not import app or package public API "${specifier}"`)
    }
  }
}

const builderEngineImportAllowed = new Set([
  'lib/builder/BuilderEngine.ts',
  'lib/builder/BuilderEngine.test.ts',
])

for (const file of walkIncludingTests(MOL_VIEWER_SRC_DIR)) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  if (builderEngineImportAllowed.has(rel)) continue
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    if (specifier.includes('BuilderEngine')) {
      violations.push(`${rel}: import builder commands or focused builder modules instead of BuilderEngine`)
    }
  }
}

const storeCommandsImportAllowed = new Set([
  'lib/builder/commands/index.ts',
  'lib/builder/commands/storeCommands.ts',
])

const commandsBarrelImportAllowed = new Set([
  'lib/builder/commands/index.ts',
])

for (const file of walkIncludingTests(MOL_VIEWER_SRC_DIR)) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  if (storeCommandsImportAllowed.has(rel)) continue
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''
    if (normalizedResolved === 'lib/builder/commands/storeCommands') {
      violations.push(`${rel}: import the focused command module instead of the storeCommands compatibility barrel`)
    }
  }
}

for (const file of walkIncludingTests(MOL_VIEWER_SRC_DIR)) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  if (commandsBarrelImportAllowed.has(rel)) continue
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''
    if (normalizedResolved === 'lib/builder/commands') {
      violations.push(`${rel}: import a focused lib/builder/commands/* module instead of the commands barrel`)
    }
  }
}

for (const file of walk(MOL_VIEWER_SRC_DIR)) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''
    const importsBuilderEditing =
      normalizedResolved.startsWith('lib/builder/editing') ||
      specifier.replaceAll('\\', '/').includes('/builder/editing')

    if (
      importsBuilderEditing &&
      (
        rel === 'index.ts' ||
        rel.startsWith('store/') ||
        rel.startsWith('hooks/') ||
        rel.startsWith('components/') ||
        rel.startsWith('public/')
      )
    ) {
      violations.push(`${rel}: use builder commands instead of importing builder editing internals`)
    }
  }
}

for (const file of walk(join(MOL_VIEWER_SRC_DIR, 'store/slices'))) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  if (rel !== 'store/slices/editSlice.ts') continue
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''
    if (normalizedResolved.startsWith('lib/builder/commands/')) {
      violations.push(`${rel}: keep concrete command mappings in focused *EditActions.ts files`)
    }
  }
}

for (const file of walk(join(MOL_VIEWER_SRC_DIR, 'store/slices'))) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''
    if (
      normalizedResolved === 'lib/builder/graph' ||
      normalizedResolved === 'lib/builder/valence' ||
      normalizedResolved.startsWith('lib/builder/kernel') ||
      normalizedResolved.startsWith('lib/builder/editing')
    ) {
      violations.push(`${rel}: store slices must use builder commands instead of low-level builder rules`)
    }
  }
}

for (const file of walk(join(MOL_VIEWER_SRC_DIR, 'hooks'))) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  if (!/hooks\/builder.*Handlers\.ts$/.test(rel)) continue
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''
    if (normalizedResolved.startsWith('lib/builder/commands/')) {
      violations.push(`${rel}: route through builder*Effects.ts instead of importing builder commands directly`)
    }
  }
}

for (const file of walk(join(MOL_VIEWER_SRC_DIR, 'hooks'))) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  if (rel === 'hooks/builderEditCommandEffects.ts') continue
  const source = readFileSync(file, 'utf8')
  if (/\bapplyEditCommandResult\s*\(/.test(source)) {
    violations.push(`${rel}: use runEditCommand for hook-side edit command execution`)
  }
}

const canvasPointerRouterFile = join(MOL_VIEWER_SRC_DIR, 'hooks/useCanvasPointerRouter.ts')
const canvasPointerRouterSource = readFileSync(canvasPointerRouterFile, 'utf8')
if (/\b(runObjectPointerTransformCommand|applyObjectTransformResult)\s*\(/.test(canvasPointerRouterSource)) {
  violations.push('hooks/useCanvasPointerRouter.ts: commit object transforms through commitObjectPointerTransform')
}
if (/\bresolveBoxSelectResult\s*\(/.test(canvasPointerRouterSource)) {
  violations.push('hooks/useCanvasPointerRouter.ts: commit box selection through commitBoxSelect')
}

const molViewerSyncFile = join(MOL_VIEWER_SRC_DIR, 'hooks/useMolViewerSync.ts')
const molViewerSyncSource = readFileSync(molViewerSyncFile, 'utf8')
if (/useMoleculeStore\.getState\(\)\.(setMolecule|selectAtoms)\s*\(/.test(molViewerSyncSource)) {
  violations.push('hooks/useMolViewerSync.ts: commit controlled molecule/selection props through useMolViewerSyncEffects')
}

const atomContextMenuFile = join(MOL_VIEWER_SRC_DIR, 'components/viewer/AtomContextMenu.tsx')
const atomContextMenuSource = readFileSync(atomContextMenuFile, 'utf8')
if (/useMoleculeStore\.getState\(\)\.(selectAtom|addOneHydrogen|replaceAtoms|removeAtoms|setAtomCharge|setAtomRadical)\s*\(/.test(atomContextMenuSource)) {
  violations.push('components/viewer/AtomContextMenu.tsx: commit context menu edits through atomContextMenuEffects')
}

const rotateGizmoFile = join(MOL_VIEWER_SRC_DIR, 'components/viewer/RotateGizmo.tsx')
const rotateGizmoSource = readFileSync(rotateGizmoFile, 'utf8')
if (/useMoleculeStore\.getState\(\)\.setAtomPositions\s*\(/.test(rotateGizmoSource)) {
  violations.push('components/viewer/RotateGizmo.tsx: create gizmo store callbacks through rotateGizmoEffects')
}

const publicViewerFile = join(MOL_VIEWER_SRC_DIR, 'public/viewer.ts')
const publicViewerSource = readFileSync(publicViewerFile, 'utf8')
for (const specifier of collectModuleSpecifiers(publicViewerSource)) {
  if (specifier.includes('BuilderEngine')) {
    violations.push('public/viewer.ts: viewer public sub-entry must not export BuilderEngine editing algorithms')
  }
}

const directTransactionAllowed = new Set([
  'packages/mol-viewer/src/store/slices/editSlice.ts',
  'packages/mol-viewer/src/hooks/editSessionFactory.ts',
])

for (const [rootName, rootDir] of [
  ['apps/retainmol/src', SRC_DIR],
  ['packages/mol-viewer/src', MOL_VIEWER_SRC_DIR],
]) {
  for (const file of walk(rootDir)) {
    const rel = `${rootName}/${relative(rootDir, file).replaceAll('\\', '/')}`
    if (directTransactionAllowed.has(rel)) continue
    const source = readFileSync(file, 'utf8')
    if (/\b(beginTransaction|endTransaction)\s*\(/.test(source)) {
      violations.push(`${rel}: use an edit session instead of calling beginTransaction/endTransaction directly`)
    }
  }
}

if (violations.length > 0) {
  console.error('Boundary check failed:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log('Boundary check passed.')
