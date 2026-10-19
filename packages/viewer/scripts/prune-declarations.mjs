import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const packageDir = resolve(import.meta.dirname, '..')
const distDir = join(packageDir, 'dist')
const pkg = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) files.push(...walk(path))
    else files.push(path)
  }
  return files
}

function declarationSpecifiers(source) {
  const specifiers = []
  const patterns = [
    /\bfrom\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s+['"]([^'"]+)['"]/g,
    /\/\/\/\s*<reference\s+path=['"]([^'"]+)['"]/g,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(source))) specifiers.push(match[1])
  }
  return specifiers
}

function resolveDeclaration(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null
  const base = resolve(dirname(fromFile), specifier)
  const candidates = [
    base,
    `${base}.d.ts`,
    join(base, 'index.d.ts'),
  ]
  return candidates.find(candidate => candidate.endsWith('.d.ts') && existsSync(candidate)) ?? null
}

const declarations = new Set(walk(distDir).filter(file => file.endsWith('.d.ts')))
const roots = new Set(
  Object.values(pkg.exports)
    .map(entry => entry.types)
    .filter(Boolean)
    .map(target => resolve(packageDir, target)),
)
const reachable = new Set()
const queue = [...roots]

while (queue.length > 0) {
  const file = queue.pop()
  if (reachable.has(file)) continue
  if (!declarations.has(file)) throw new Error(`Missing declaration entry: ${file}`)
  reachable.add(file)
  const source = readFileSync(file, 'utf8')
  for (const specifier of declarationSpecifiers(source)) {
    const dependency = resolveDeclaration(file, specifier)
    if (dependency && !reachable.has(dependency)) queue.push(dependency)
  }
}

for (const file of declarations) {
  if (!reachable.has(file)) rmSync(file)
}
for (const file of walk(distDir).filter(file => file.endsWith('.d.ts.map'))) rmSync(file)

function removeEmptyDirectories(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) removeEmptyDirectories(path)
  }
  if (dir !== distDir && readdirSync(dir).length === 0) rmSync(dir, { recursive: true })
}
removeEmptyDirectories(distDir)

console.log(`Declaration closure: ${reachable.size}/${declarations.size} files retained.`)
