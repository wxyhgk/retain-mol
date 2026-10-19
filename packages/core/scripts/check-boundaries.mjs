import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { buildModuleGraph, checkEditingBoundaries, checkElementBoundaries, checkFoundations, checkPureEntries, runtimeCycles } from './module-graph.mjs'

const srcDir = resolve(import.meta.dirname, '../src')
// 整包外部依赖白名单（含类型导入）：core 不得接触 React / three / 状态库 / viewer。
const ALLOWED_EXTERNALS = ['openchemlib', 'zod']

function rel(path) {
  return relative(srcDir, path).replaceAll('\\', '/')
}

const graph = buildModuleGraph(srcDir)
const violations = [
  ...checkFoundations(graph, srcDir),
  ...checkPureEntries(graph, srcDir),
  ...checkEditingBoundaries(graph, srcDir),
  ...checkElementBoundaries(graph, srcDir),
]

for (const cycle of runtimeCycles(graph)) {
  violations.push(`Runtime import cycle: ${cycle.map(rel).join(', ')}`)
}

for (const [file, edges] of graph) {
  const fileRel = rel(file)
  const source = readFileSync(file, 'utf8')

  if (/\bimport\.meta\.env(?:\.|\[)/.test(source)) {
    violations.push(`${fileRel}: core must receive runtime configuration from its host`)
  }

  for (const edge of edges) {
    if (edge.target) {
      if (rel(edge.target).startsWith('..')) {
        violations.push(`${fileRel}:${edge.line}: core must not reach outside its src via "${edge.specifier}"`)
      }
      continue
    }
    if (!ALLOWED_EXTERNALS.some(dep => edge.specifier === dep || edge.specifier?.startsWith(`${dep}/`))) {
      violations.push(`${fileRel}:${edge.line}: core must not depend on "${edge.specifier ?? '<non-literal import>'}" (including type imports)`)
    }
  }

  if (fileRel.startsWith('public/contracts/')) {
    for (const edge of edges) {
      if (edge.target && /^(lib)\//.test(rel(edge.target))) {
        violations.push(`${fileRel}: public contracts must not derive from internal implementation "${rel(edge.target)}"`)
      }
    }
  }

  if (fileRel === 'lib/builder/fragment/model.ts') {
    for (const edge of edges) {
      if (edge.specifier !== '../../model/types') {
        violations.push(`${fileRel}: fragment model may only depend on the pure core type leaf, not "${edge.specifier}"`)
      }
    }
  }
}

if (violations.length > 0) {
  console.error('core boundary check failed:')
  violations.forEach(violation => console.error(`- ${violation}`))
  process.exit(1)
}

console.log('core boundaries passed (openchemlib/zod-only externals, foundation and element ownership, pure entry closures, runtime cycles).')
