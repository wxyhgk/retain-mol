import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { buildModuleGraph, checkFoundations, checkPureEntries, runtimeCycles } from './module-graph.mjs'

const srcDir = resolve(import.meta.dirname, '../src')

function rel(path) {
  return relative(srcDir, path).replaceAll('\\', '/')
}

const graph = buildModuleGraph(srcDir)
const violations = [...checkFoundations(graph, srcDir), ...checkPureEntries(graph, srcDir)]

for (const cycle of runtimeCycles(graph)) {
  violations.push(`Runtime import cycle: ${cycle.map(rel).join(', ')}`)
}

for (const [file, edges] of graph) {
  const fileRel = rel(file)
  const source = readFileSync(file, 'utf8')
  const imports = edges.flatMap(edge => edge.specifier === null ? [] : [edge.specifier])
  const resolveLocal = (_file, specifier) => edges.find(edge => edge.specifier === specifier)?.target

  if (/\bimport\.meta\.env(?:\.|\[)/.test(source)) {
    violations.push(`${fileRel}: mol-viewer must receive runtime configuration from its host`)
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
  console.error('mol-viewer boundary check failed:')
  violations.forEach(violation => console.error(`- ${violation}`))
  process.exit(1)
}

console.log('mol-viewer boundaries passed (foundation ownership, pure entry closures, runtime cycles, Builder/Renderer/Style directions).')
