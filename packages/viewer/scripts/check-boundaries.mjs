import { existsSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { buildModuleGraph, checkEditingBoundaries, checkElementBoundaries, checkFoundations, runtimeCycles } from '../../core/scripts/module-graph.mjs'

const srcDir = resolve(import.meta.dirname, '../src')
const coreSrcDir = resolve(import.meta.dirname, '../../core/src')
const CORE_INTERNAL = '@retainmol/core/internal/'
// core 内的兼容门面：viewer 必须导入真正的归属模块。
const CORE_FACADES = new Set(['lib/types', 'lib/builder/graph', 'lib/builder/analysis/fragments',
  'lib/moleculeValidation', 'lib/elements', 'config/elements.config'])

function rel(path) {
  return relative(srcDir, path).replaceAll('\\', '/')
}

const graph = buildModuleGraph(srcDir)
const violations = [
  ...checkFoundations(graph, srcDir),
  ...checkEditingBoundaries(graph, srcDir),
  ...checkElementBoundaries(graph, srcDir),
]

for (const cycle of runtimeCycles(graph)) {
  violations.push(`Runtime import cycle: ${cycle.map(rel).join(', ')}`)
}

for (const [file, edges] of graph) {
  const fileRel = rel(file)
  const source = readFileSync(file, 'utf8')
  const imports = edges.flatMap(edge => edge.specifier === null ? [] : [edge.specifier])
  const resolveLocal = (_file, specifier) => edges.find(edge => edge.specifier === specifier)?.target

  if (/\bimport\.meta\.env(?:\.|\[)/.test(source)) {
    violations.push(`${fileRel}: viewer must receive runtime configuration from its host`)
  }

  for (const edge of edges) {
    if (edge.target && rel(edge.target).startsWith('..')) {
      violations.push(`${fileRel}:${edge.line}: import @retainmol/core by package name instead of "${edge.specifier}"`)
    }
    if (!edge.specifier?.startsWith(CORE_INTERNAL)) continue
    const internalPath = edge.specifier.slice(CORE_INTERNAL.length)
    if (fileRel === 'index.ts' || fileRel.startsWith('public/')) {
      violations.push(`${fileRel}:${edge.line}: public entries must re-export @retainmol/core public entries, not "${edge.specifier}"`)
    }
    if (!existsSync(resolve(coreSrcDir, `${internalPath}.ts`))) {
      violations.push(`${fileRel}:${edge.line}: "${edge.specifier}" does not name a @retainmol/core source module`)
    }
    if (CORE_FACADES.has(internalPath)) {
      violations.push(`${fileRel}:${edge.line}: import the owning module instead of compatibility facade "${edge.specifier}"`)
    }
  }

  if (fileRel.startsWith('lib/builder/')) {
    for (const specifier of imports) {
      if (specifier === 'three' || specifier.startsWith('three/')) {
        violations.push(`${fileRel}: Builder must use pure vector/transform DTOs, not Three.js`)
      }
      if (['react', 'react-dom', 'zustand', 'zundo', 'clsx', 'tailwind-merge'].some(dep => specifier === dep || specifier.startsWith(`${dep}/`))) {
        violations.push(`${fileRel}: Builder must not depend on UI/state dependency "${specifier}"`)
      }

      const target = resolveLocal(file, specifier)
      if (!target) continue
      const targetRel = rel(target)
      if (
        targetRel.startsWith('lib/molRenderer/')
        || targetRel.startsWith('hooks/')
        || targetRel.startsWith('components/')
        || targetRel.startsWith('store/')
        || targetRel.startsWith('runtime/')
        || targetRel.startsWith('application/')
      ) {
        violations.push(`${fileRel}: Builder must not depend on upper layer "${targetRel}"`)
      }
    }
  }

  if (!fileRel.startsWith('lib/molRenderer/')) {
    for (const specifier of imports) {
      const target = resolveLocal(file, specifier)
      if (target && rel(target) === 'lib/molRenderer/MolRenderer.ts') {
        violations.push(`${fileRel}: depend on RendererPort capabilities instead of concrete MolRenderer`)
      }
    }
  }

  if (fileRel.startsWith('lib/molRenderer/')) {
    for (const specifier of imports) {
      const target = resolveLocal(file, specifier)
      if (!target || !rel(target).startsWith('lib/builder/')) continue
      violations.push(`${fileRel}: Renderer must consume prepared DTOs instead of Builder "${rel(target)}"`)
    }
  }

  if (fileRel.startsWith('styles/')) {
    for (const specifier of imports) {
      const target = resolveLocal(file, specifier)
      if (!target || !rel(target).startsWith('lib/molRenderer/')) continue
      violations.push(`${fileRel}: declarative styles must not depend on renderer implementation "${rel(target)}"`)
    }
  }

  if (fileRel === 'public/styles.ts') {
    for (const specifier of imports) {
      const target = resolveLocal(file, specifier)
      if (target && rel(target).startsWith('lib/molRenderer/')) {
        violations.push(`${fileRel}: Three.js extension APIs belong in public/three.ts`)
      }
    }
  }

  if (fileRel === 'public/viewer.ts' && /\bThreeRenderer(?:Port|OverlayPort)\b/.test(source)) {
    violations.push(`${fileRel}: public viewer API must expose renderer capabilities without Three.js implementation types`)
  }

  if (fileRel.startsWith('public/contracts/')) {
    for (const specifier of imports) {
      const target = resolveLocal(file, specifier)
      if (!target) continue
      const targetRel = rel(target)
      if (/^(lib|store|hooks|components)\//.test(targetRel)) {
        violations.push(`${fileRel}: public contracts must not derive from internal implementation "${targetRel}"`)
      }
    }
  }

  if (fileRel === 'lib/builder/fragment/model.ts') {
    for (const specifier of imports) {
      if (specifier !== '../../model/types') {
        violations.push(`${fileRel}: fragment model may only depend on the pure core type leaf, not "${specifier}"`)
      }
    }
  }
}

if (violations.length > 0) {
  console.error('viewer boundary check failed:')
  violations.forEach(violation => console.error(`- ${violation}`))
  process.exit(1)
}

console.log('viewer boundaries passed (core imported by package name, public entries use core public API, runtime cycles, Builder/Renderer/Style directions).')
