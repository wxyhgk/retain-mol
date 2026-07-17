import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, normalize, relative, resolve } from 'node:path'

const SRC_DIR = new URL('../src', import.meta.url).pathname
const MOL_VIEWER_SRC_DIR = new URL('../../../packages/mol-viewer/src', import.meta.url).pathname
const MOL_VIEWER_COMMANDS_DIR = join(MOL_VIEWER_SRC_DIR, 'lib/builder/commands')
const allowedMolViewerImports = new Set([
  '@retainmol/mol-viewer/core',
  '@retainmol/mol-viewer/coordination',
  '@retainmol/mol-viewer/fragments',
  '@retainmol/mol-viewer/io',
  '@retainmol/mol-viewer/optimize',
  '@retainmol/mol-viewer/pubchem',
  '@retainmol/mol-viewer/samples',
  '@retainmol/mol-viewer/styles',
  '@retainmol/mol-viewer/templates',
  '@retainmol/mol-viewer/three',
  '@retainmol/mol-viewer/viewer',
  '@retainmol/mol-viewer/runtime',
  '@retainmol/mol-viewer/state',
  '@retainmol/mol-viewer/editing',
  '@retainmol/mol-viewer/geometry',
  '@retainmol/mol-viewer/graph',
  '@retainmol/mol-viewer/modeling',
  '@retainmol/mol-viewer/picking',
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

// Shared UI/data primitives must remain business-agnostic and may never depend on features.
for (const sharedRoot of ['components/ui', 'components/data']) {
  for (const file of walk(join(SRC_DIR, sharedRoot))) {
    const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
    for (const specifier of collectModuleSpecifiers(readFileSync(file, 'utf8'))) {
      if (specifier.startsWith('@/features/') || specifier.startsWith('../../features/')) {
        violations.push(`${rel}: shared components must not depend on feature implementations`)
      }
    }
  }
}

// Heavy component libraries are isolated behind one adapter component per capability.
const thirdPartyComponentAdapters = new Map([
  ['@tanstack/react-table', ['components/data/DataTable.tsx']],
  ['react-virtuoso', ['components/data/VirtualList.tsx']],
  ['react-dropzone', ['components/data/FileDropzone.tsx']],
  ['echarts', ['features/analysis/infrastructure/echartsAdapter.ts']],
  ['@xyflow/react', [
    'features/workflows/components/WorkflowCanvas.tsx',
    'features/workflows/components/WorkflowReadOnlyCanvas.tsx',
  ]],
])
for (const file of walk(SRC_DIR)) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
  for (const specifier of collectModuleSpecifiers(readFileSync(file, 'utf8'))) {
    for (const [packageName, allowedFiles] of thirdPartyComponentAdapters) {
      if ((specifier === packageName || specifier.startsWith(`${packageName}/`)) && !allowedFiles.includes(rel)) {
        violations.push(`${rel}: import ${specifier} through ${allowedFiles.join(' or ')}`)
      }
    }
  }
}

// Server cache belongs to Query/infrastructure. Zustand models contain UI state only.
for (const file of walk(join(SRC_DIR, 'features'))) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
  const source = readFileSync(file, 'utf8')
  if (
    rel.includes('/model/')
    && /\bfrom\s+['"]zustand['"]/.test(source)
    && collectModuleSpecifiers(source).some(specifier => specifier.includes('/infrastructure/'))
  ) {
    violations.push(`${rel}: feature models must not copy server data from infrastructure into Zustand`)
  }
  if ((rel.endsWith('Page.tsx') || rel.includes('/components/')) && /\bfetch\s*\(/.test(source)) {
    violations.push(`${rel}: pages and components must call feature infrastructure instead of fetch`)
  }
}

for (const rel of [
  'components/toolbar/BuildPanel.tsx',
  'components/panels/ElementPicker.tsx',
]) {
  if (existsSync(join(SRC_DIR, rel))) {
    violations.push(`${rel}: removed duplicate build-mode implementation must not be restored`)
  }
}

for (const rel of [
  'components/toolbar/ToolStrip.tsx',
  'domain/buildModeCommands.ts',
  'domain/buildTools.ts',
]) {
  if (existsSync(join(SRC_DIR, rel))) {
    violations.push(`${rel}: build palette code belongs in features/build-palette`)
  }
}

for (const rel of [
  'domain/geometryOptimizationService.ts',
  'lib/xtbOptimize.ts',
  'lib/uffOptimize.ts',
]) {
  if (existsSync(join(SRC_DIR, rel))) {
    violations.push(`${rel}: geometry optimization code belongs in features/geometry-optimization`)
  }
}

for (const rel of [
  'domain/importPlacementService.ts',
  'domain/moleculePlacementRequestGate.ts',
  'domain/moleculePlacementService.ts',
  'lib/uiStore.ts',
]) {
  if (existsSync(join(SRC_DIR, rel))) {
    violations.push(`${rel}: use the focused molecule-placement feature or app task store`)
  }
}

for (const rel of [
  'domain/templateDraftStorage.ts',
  'domain/templateStructureImport.ts',
  'domain/workspaceTemplateFragments.ts',
  'features/template-studio/catalog.ts',
  'features/template-studio/infrastructure/templateDraftRepository.ts',
]) {
  if (existsSync(join(SRC_DIR, rel))) {
    violations.push(`${rel}: template persistence belongs in the independent features/template-library capability`)
  }
}

if (existsSync(join(SRC_DIR, 'lib/moleculeOpt.ts'))) {
  violations.push('lib/moleculeOpt.ts: split Worker computation from molecule animation features')
}

for (const file of walk(join(SRC_DIR, 'features/molecular-computation/infrastructure'))) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
  for (const specifier of collectModuleSpecifiers(readFileSync(file, 'utf8'))) {
    if (specifier.startsWith('@/domain/') || specifier.startsWith('@/store/')) {
      violations.push(`${rel}: computation transport must not depend on viewer or app state`)
    }
  }
}

const templateStudioPageSource = readFileSync(
  join(SRC_DIR, 'features/template-studio/TemplateStudioPage.tsx'),
  'utf8',
)
for (const forbidden of [
  'localStorage',
  'createAtomAttachmentSite',
  'createEdgeAttachmentSite',
  'parseTemplateStructureFile',
  'saveTemplateDraft',
]) {
  if (templateStudioPageSource.includes(forbidden)) {
    violations.push(`features/template-studio/TemplateStudioPage.tsx: layout must not own "${forbidden}"`)
  }
}
const templateStudioControllerSource = readFileSync(
  join(SRC_DIR, 'features/template-studio/model/useTemplateStudioController.ts'),
  'utf8',
)
for (const forbidden of ['TemplateAttachmentSite', 'addAtomSite', 'addEdgeSite', 'focusSite']) {
  if (templateStudioControllerSource.includes(forbidden)) {
    violations.push(`features/template-studio: attachment sites are selected at runtime; remove "${forbidden}" from the studio`)
  }
}

const toolStripSource = readFileSync(join(SRC_DIR, 'features/build-palette/ToolStrip.tsx'), 'utf8')
if (/\b(setActiveElement|setAtomClickMode|setActiveFragment)\s*\(/.test(toolStripSource)) {
  violations.push('features/build-palette/ToolStrip.tsx: route transitions through the build palette controller')
}

const buildPaletteControllerSource = readFileSync(
  join(SRC_DIR, 'features/build-palette/model/useBuildPaletteController.ts'),
  'utf8',
)
if (/['"]rings['"]/.test(buildPaletteControllerSource)) {
  violations.push('features/build-palette: rings belong to the unified template panel')
}
if (existsSync(join(SRC_DIR, 'features/build-palette/components/RingPalette.tsx'))) {
  violations.push('features/build-palette/components/RingPalette.tsx: render rings inside TemplatePalette')
}

const removedBuilderCompatibilityFiles = [
  'lib/builder/BuilderEngine.ts',
  'lib/builder/editing/fragmentOps.ts',
  'lib/builder/commands/index.ts',
  'lib/builder/commands/editCommands.ts',
  'lib/builder/commands/storeCommands.ts',
  'lib/builder/commands/topologyStoreCommands.ts',
  'lib/builder/commands/geometry/geometryStoreCommands.ts',
  'lib/builder/commands/scene/moleculeStoreCommands.ts',
  'lib/builder/commands/selection/removalStoreCommands.ts',
  'public/editActions.ts',
]
const removedBuilderCompatibilityModules = new Set(
  removedBuilderCompatibilityFiles.map(file => file.replace(/\.ts$/, '')),
)

for (const rel of removedBuilderCompatibilityFiles) {
  if (existsSync(join(MOL_VIEWER_SRC_DIR, rel))) {
    violations.push(`${rel}: removed builder compatibility entry must not be restored`)
  }
}

const rootEntrySource = readFileSync(join(MOL_VIEWER_SRC_DIR, 'index.ts'), 'utf8')
for (const symbol of ['FRAGMENTS', 'bondSelectedAtoms', 'canBond', 'calcAddAtomOnExisting', 'useBuilder', 'cn']) {
  if (new RegExp(`\\b${symbol}\\b`).test(rootEntrySource)) {
    violations.push(`index.ts: root entry must not expose internal or mutable symbol "${symbol}"`)
  }
}

const molRendererSource = readFileSync(
  join(MOL_VIEWER_SRC_DIR, 'lib/molRenderer/MolRenderer.ts'),
  'utf8',
)
if (/\b(_molRenderers|_objectGroups)\b/.test(molRendererSource)) {
  violations.push('lib/molRenderer/MolRenderer.ts: delegate scene-object renderer maps to MoleculeSceneLayer')
}

const moleculeRendererSource = readFileSync(
  join(MOL_VIEWER_SRC_DIR, 'lib/molRenderer/MoleculeRenderer.ts'),
  'utf8',
)
if (/MoleculeSelectionVisuals|new\s+THREE\.SphereGeometry/.test(moleculeRendererSource)) {
  violations.push('lib/molRenderer/MoleculeRenderer.ts: delegate atom and selection rendering to MoleculeAtomRenderer')
}

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

    if (
      new Set([
        '@retainmol/mol-viewer/viewer',
        '@retainmol/mol-viewer/runtime',
        '@retainmol/mol-viewer/state',
        '@retainmol/mol-viewer/editing',
        '@retainmol/mol-viewer/geometry',
      ]).has(specifier)
      && !rel.replaceAll('\\', '/').startsWith('domain/viewer/')
    ) {
      violations.push(`${rel}: import viewer runtime through a focused "@/domain/viewer/*" adapter`)
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

    if (
      !rel.replaceAll('\\', '/').startsWith('features/molecule-placement/')
      && specifier.startsWith('@/features/molecule-placement/')
    ) {
      violations.push(`${rel}: import molecule placement through its feature facade`)
    }

    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(SRC_DIR, resolved).replaceAll('\\', '/') : ''
    if (
      !rel.replaceAll('\\', '/').startsWith('features/geometry-optimization/')
      && normalizedResolved.startsWith('features/geometry-optimization/')
      && normalizedResolved !== 'features/geometry-optimization/index'
    ) {
      violations.push(`${rel}: import geometry optimization through its feature facade`)
    }
  }
}

for (const file of walk(join(SRC_DIR, 'features/geometry-optimization/infrastructure'))) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
  for (const specifier of collectModuleSpecifiers(readFileSync(file, 'utf8'))) {
    if (
      specifier.startsWith('@/domain/')
      || specifier.startsWith('@/features/')
      || specifier === '@/store/appTaskStore'
    ) {
      violations.push(`${rel}: infrastructure clients must not depend on app state or feature orchestration`)
    }
  }
}

if (existsSync(join(SRC_DIR, 'domain/viewerAdapter.ts'))) {
  violations.push('domain/viewerAdapter.ts: use focused domain/viewer capability adapters')
}

for (const rel of [
  'components/panels/RightPanel.tsx',
  'features/geometry/components/GeometryPanel.tsx',
  'features/scene/components/ScenePanel.tsx',
]) {
  const source = readFileSync(join(SRC_DIR, rel), 'utf8')
  if (/\buseMoleculeStore\s*\(\s*\)/.test(source)) {
    violations.push(`${rel}: subscribe through a focused molecule-store selector`)
  }
}

for (const rel of [
  'components/layout/CanvasLabel.tsx',
  'hooks/useMoleculeInfo.ts',
]) {
  const source = readFileSync(join(SRC_DIR, rel), 'utf8')
  if (!source.includes("from '@retainmol/mol-viewer/core'")) {
    violations.push(`${rel}: derive molecular formula and weight through @retainmol/mol-viewer/core`)
  }
  if (/new\s+Map\s*<\s*string\s*,\s*number\s*>|\.atomicMass\b/.test(source)) {
    violations.push(`${rel}: do not duplicate molecular formula or weight calculations in the app`)
  }
}

for (const file of walkIncludingTests(SRC_DIR)) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
  if (rel === 'domain/viewer/history.ts') continue
  if (/\buseMoleculeTemporal\b/.test(readFileSync(file, 'utf8'))) {
    violations.push(`${rel}: use the narrow molecule history adapter instead of temporal store internals`)
  }
}

const appDomainDirectEditAllowed = new Set([
  'domain/appEditEffects.ts',
])

for (const file of walk(join(SRC_DIR, 'domain'))) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    if (specifier.startsWith('@/features/')) {
      violations.push(`${rel}: app domain must not depend on feature implementations`)
    }
  }
  if (appDomainDirectEditAllowed.has(rel)) continue
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

for (const file of walkIncludingTests(MOL_VIEWER_SRC_DIR)) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''
    if (removedBuilderCompatibilityModules.has(normalizedResolved)) {
      violations.push(`${rel}: import the focused builder module instead of removed compatibility entry "${specifier}"`)
    }
  }
}

// ── App feature graph: facade-only cross-feature imports + cycle detection ──
const featureGraph = new Map()

function featureNameForPath(path) {
  return path.replaceAll('\\', '/').match(/^features\/([^/]+)\//)?.[1] ?? null
}

function featureTarget(file, specifier) {
  const aliasMatch = specifier.match(/^@\/features\/([^/]+)(?:\/(.*))?$/)
  if (aliasMatch) return { name: aliasMatch[1], deep: Boolean(aliasMatch[2]) }
  const resolved = resolveRelativeSpecifier(file, specifier)
  if (!resolved) return null
  const rel = relative(SRC_DIR, resolved).replaceAll('\\', '/')
  const name = featureNameForPath(rel)
  return name ? { name, deep: true } : null
}

for (const file of walk(join(SRC_DIR, 'features'))) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
  const sourceFeature = featureNameForPath(rel)
  if (!sourceFeature) continue
  if (!featureGraph.has(sourceFeature)) featureGraph.set(sourceFeature, new Set())
  for (const specifier of collectModuleSpecifiers(readFileSync(file, 'utf8'))) {
    const target = featureTarget(file, specifier)
    if (!target || target.name === sourceFeature) continue
    featureGraph.get(sourceFeature).add(target.name)
    if (target.deep) {
      violations.push(`${rel}: import feature ${target.name} through "@/features/${target.name}" facade`)
    }
  }
}

for (const component of stronglyConnectedComponents(featureGraph)) {
  if (component.length > 1) {
    violations.push(`app feature dependency cycle: ${component.join(' -> ')}`)
  }
}

// Infrastructure and public package facades must not leak mutable runtime stores.
for (const file of walk(join(SRC_DIR, 'features'))) {
  const rel = relative(SRC_DIR, file).replaceAll('\\', '/')
  if (!rel.includes('/infrastructure/')) continue
  const imports = collectModuleSpecifiers(readFileSync(file, 'utf8'))
  if (imports.some(specifier =>
    specifier.startsWith('@/domain/viewer/') ||
    specifier.startsWith('@/store/') ||
    specifier === '@retainmol/mol-viewer/viewer'
  )) {
    violations.push(`${rel}: feature infrastructure must not depend on viewer or app runtime stores`)
  }
}

for (const file of walk(join(MOL_VIEWER_SRC_DIR, 'public'))) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  if (rel === 'public/viewer.ts' || rel === 'public/state.ts') continue
  const source = readFileSync(file, 'utf8')
  if (/from ['"]\.\.\/store\//.test(source) || /\buse(?:Molecule|Editor)Store\b/.test(source)) {
    violations.push(`${rel}: public facade must not expose mutable runtime stores`)
  }
}

const commandDomains = new Set([
  'atom',
  'bond',
  'clipboard',
  'fragment',
  'geometry',
  'interaction',
  'scene',
  'selection',
  'shared',
])

const commandDomainDependencies = new Map([
  ['atom', new Set(['shared'])],
  ['bond', new Set(['shared'])],
  ['clipboard', new Set(['shared'])],
  ['fragment', new Set(['shared'])],
  ['geometry', new Set(['shared'])],
  ['interaction', new Set(['atom', 'bond', 'fragment', 'geometry', 'shared'])],
  ['scene', new Set(['geometry', 'shared'])],
  ['selection', new Set(['shared'])],
  ['shared', new Set()],
])

function commandDomainForResolvedPath(resolved) {
  const rel = relative(MOL_VIEWER_COMMANDS_DIR, resolved).replaceAll('\\', '/')
  const domain = rel.split('/')[0]
  return commandDomains.has(domain) ? domain : null
}

const commandDomainGraph = new Map(
  [...commandDomains].map(domain => [domain, new Set()]),
)

for (const file of walk(MOL_VIEWER_COMMANDS_DIR)) {
  const rel = relative(MOL_VIEWER_COMMANDS_DIR, file).replaceAll('\\', '/')
  const sourceDomain = rel.split('/')[0]
  if (!commandDomains.has(sourceDomain)) continue
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    if (!resolved) continue
    const targetDomain = commandDomainForResolvedPath(resolved)
    if (!targetDomain || targetDomain === sourceDomain) continue
    commandDomainGraph.get(sourceDomain).add(targetDomain)
    if (!commandDomainDependencies.get(sourceDomain)?.has(targetDomain)) {
      violations.push(`${relative(MOL_VIEWER_SRC_DIR, file)}: commands/${sourceDomain} must not depend on commands/${targetDomain}`)
    }
    if (specifier.replaceAll('\\', '/') !== `../${targetDomain}`) {
      violations.push(`${relative(MOL_VIEWER_SRC_DIR, file)}: import commands/${targetDomain} through its domain facade`)
    }
  }
}

// Tests may exercise another domain, but still go through that domain's public facade.
for (const file of walkIncludingTests(MOL_VIEWER_COMMANDS_DIR)) {
  const rel = relative(MOL_VIEWER_COMMANDS_DIR, file).replaceAll('\\', '/')
  const sourceDomain = rel.split('/')[0]
  if (!commandDomains.has(sourceDomain)) continue
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    if (!resolved) continue
    const targetDomain = commandDomainForResolvedPath(resolved)
    if (
      targetDomain &&
      targetDomain !== sourceDomain &&
      specifier.replaceAll('\\', '/') !== `../${targetDomain}`
    ) {
      violations.push(`${relative(MOL_VIEWER_SRC_DIR, file)}: test imports commands/${targetDomain} through an internal file`)
    }
  }
}

for (const domain of commandDomains) {
  const facade = join(MOL_VIEWER_COMMANDS_DIR, domain, 'index.ts')
  if (!existsSync(facade)) continue
  for (const specifier of collectModuleSpecifiers(readFileSync(facade, 'utf8'))) {
    if (!specifier.startsWith('./')) {
      violations.push(`${relative(MOL_VIEWER_SRC_DIR, facade)}: a domain facade may only export its own files`)
    }
    if (/Decision(?:\.ts)?$/.test(specifier)) {
      violations.push(`${relative(MOL_VIEWER_SRC_DIR, facade)}: decision modules are domain-internal`)
    }
  }
}

function stronglyConnectedComponents(graph) {
  let nextIndex = 0
  const stack = []
  const onStack = new Set()
  const indexByNode = new Map()
  const lowLink = new Map()
  const components = []

  function visit(node) {
    indexByNode.set(node, nextIndex)
    lowLink.set(node, nextIndex++)
    stack.push(node)
    onStack.add(node)
    for (const target of graph.get(node) ?? []) {
      if (!indexByNode.has(target)) {
        visit(target)
        lowLink.set(node, Math.min(lowLink.get(node), lowLink.get(target)))
      } else if (onStack.has(target)) {
        lowLink.set(node, Math.min(lowLink.get(node), indexByNode.get(target)))
      }
    }
    if (lowLink.get(node) !== indexByNode.get(node)) return
    const component = []
    let current
    do {
      current = stack.pop()
      onStack.delete(current)
      component.push(current)
    } while (current !== node)
    components.push(component)
  }

  for (const node of graph.keys()) {
    if (!indexByNode.has(node)) visit(node)
  }
  return components
}

for (const component of stronglyConnectedComponents(commandDomainGraph)) {
  if (component.length > 1) {
    violations.push(`builder command domain cycle: ${component.join(' -> ')}`)
  }
}

for (const file of walkIncludingTests(MOL_VIEWER_SRC_DIR)) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''
    if (
      normalizedResolved === 'lib/builder/commands' ||
      normalizedResolved === 'lib/builder/commands/index'
    ) {
      violations.push(`${rel}: import a focused lib/builder/commands/* module instead of the commands barrel`)
    }
  }
}

for (const file of walkIncludingTests(MOL_VIEWER_SRC_DIR)) {
  const rel = relative(MOL_VIEWER_SRC_DIR, file).replaceAll('\\', '/')
  if (rel.startsWith('lib/builder/commands/')) continue
  const source = readFileSync(file, 'utf8')
  for (const specifier of collectModuleSpecifiers(source)) {
    const resolved = resolveRelativeSpecifier(file, specifier)
    const normalizedResolved = resolved ? relative(MOL_VIEWER_SRC_DIR, resolved).replaceAll('\\', '/') : ''
    const match = normalizedResolved.match(/^lib\/builder\/commands\/([^/]+)\/(.+)$/)
    if (match && commandDomains.has(match[1])) {
      violations.push(`${rel}: import the commands/${match[1]} domain facade instead of "${normalizedResolved}"`)
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

const interactionHandlerFile = join(MOL_VIEWER_SRC_DIR, 'lib/molRenderer/InteractionHandler.ts')
const interactionHandlerSource = readFileSync(interactionHandlerFile, 'utf8')
if (!interactionHandlerSource.includes("from './interactionGestureState'")) {
  violations.push('lib/molRenderer/InteractionHandler.ts: route atom/bond pointer lifecycle through interactionGestureState')
}
if (/private\s+_(dragging|dragAtomId|bondDragSourceId|bondDragMoved)\b/.test(interactionHandlerSource)) {
  violations.push('lib/molRenderer/InteractionHandler.ts: use the discriminated gesture state instead of parallel drag flags')
}
if (!interactionHandlerSource.includes("from './InteractionPicker'")) {
  violations.push('lib/molRenderer/InteractionHandler.ts: delegate canvas picking to InteractionPicker')
}
if (/\.intersectObjects\s*\(/.test(interactionHandlerSource)) {
  violations.push('lib/molRenderer/InteractionHandler.ts: keep raycast collection and hit resolution inside InteractionPicker')
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
