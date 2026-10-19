import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const distDir = resolve(import.meta.dirname, '../dist')

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) files.push(...walk(path))
    else if (path.endsWith('.d.ts')) files.push(path)
  }
  return files
}

function nodeNextSpecifier(fromFile, specifier) {
  if (!specifier.startsWith('.')) return specifier
  if (/\.(?:[cm]?js|json|node)$/.test(specifier)) return specifier

  const base = resolve(dirname(fromFile), specifier)
  if (existsSync(`${base}.d.ts`)) return `${specifier}.js`
  if (existsSync(join(base, 'index.d.ts'))) {
    return `${specifier.replace(/\/$/, '')}/index.js`
  }
  throw new Error(`Cannot resolve declaration import ${specifier} from ${fromFile}`)
}

const patterns = [
  /(\bfrom\s+['"])([^'"]+)(['"])/g,
  /(\bimport\s*\(\s*['"])([^'"]+)(['"]\s*\))/g,
  /(\bimport\s+['"])([^'"]+)(['"])/g,
  /(\/\/\/\s*<reference\s+path=['"])([^'"]+)(['"])/g,
]

let rewritten = 0
for (const file of walk(distDir)) {
  let source = readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    source = source.replace(pattern, (match, prefix, specifier, suffix) => {
      const next = nodeNextSpecifier(file, specifier)
      if (next !== specifier) rewritten += 1
      return `${prefix}${next}${suffix}`
    })
  }
  writeFileSync(file, source)
}

console.log(`NodeNext declaration imports normalized (${rewritten} specifiers rewritten).`)
