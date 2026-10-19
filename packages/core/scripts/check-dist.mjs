import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { buildModuleGraph, checkPureEntries } from './module-graph.mjs'

const packageDir = resolve(import.meta.dirname, '..')
const distDir = join(packageDir, 'dist')
const srcDir = join(packageDir, 'src')
const pkg = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))
const ALLOWED = ['openchemlib', 'zod']

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) files.push(...walk(path))
    else files.push(path)
  }
  return files
}

const graph = buildModuleGraph(distDir, { built: true })
const errors = checkPureEntries(graph, distDir, { built: true })

// 整个包（不只是入口闭包）只允许 OpenChemLib / Zod 两个运行时外部依赖。
for (const [file, edges] of graph) {
  for (const edge of edges) {
    if (edge.target) continue
    if (!ALLOWED.some(dep => edge.specifier === dep || edge.specifier?.startsWith(`${dep}/`))) {
      errors.push(`${relative(distDir, file)}:${edge.line} loads forbidden dependency ${edge.specifier ?? '<non-literal import>'}`)
    }
  }
}

for (const [subpath, entry] of Object.entries(pkg.exports)) {
  if (subpath.includes('*')) continue
  for (const field of ['types', 'import']) {
    if (!existsSync(resolve(packageDir, entry[field]))) {
      errors.push(`${subpath} ${field} target is missing: ${entry[field]}`)
    }
  }
}

// ./internal/* 依赖逐文件产物：每个非测试源模块都必须有同路径的 .js 与 .d.ts。
for (const file of walk(srcDir)) {
  if (!file.endsWith('.ts') || /\.(test|bench|d)\.ts$/.test(file)) continue
  const base = relative(srcDir, file).replace(/\.ts$/, '')
  for (const ext of ['.js', '.d.ts']) {
    if (!existsSync(join(distDir, base + ext))) errors.push(`internal module missing from dist: ${base}${ext}`)
  }
}

const files = walk(distDir)
if (files.some(file => file.endsWith('.d.ts.map'))) {
  errors.push('declaration maps must not be published')
}
const js = files.filter(file => file.endsWith('.js')).map(file => readFileSync(file, 'utf8')).join('\n')
if (js.includes('ZodEncodeError') || js.includes('node_modules/zod/')) {
  errors.push('zod implementation was bundled instead of externalized')
}
if (!/from\s+["']zod["']/.test(js)) {
  errors.push('headless runtime no longer references the external zod dependency')
}

if (errors.length > 0) {
  console.error('Package dist contract failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Package dist contract passed.')
