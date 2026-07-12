import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOTS = [
  ['app', new URL('../src', import.meta.url).pathname],
  ['mol-viewer', new URL('../../../packages/mol-viewer/src', import.meta.url).pathname],
]

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

function collectImports(source) {
  const imports = []
  const patterns = [
    /\bimport(?:\s+type)?[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(source))) imports.push(match[1])
  }
  return imports
}

function classify(specifier) {
  if (specifier.startsWith('@/domain/viewer/')) return 'viewer-adapter'
  if (specifier.startsWith('@retainmol/mol-viewer')) return 'mol-viewer-public'
  if (specifier.includes('moleculeStore') || specifier.includes('editorStore')) return 'viewer-store-internal'
  if (specifier.startsWith('@/')) return 'app-local'
  if (specifier.startsWith('.')) return 'relative-local'
  return 'external'
}

for (const [name, root] of ROOTS) {
  const rows = walk(root).map(file => {
    const imports = collectImports(readFileSync(file, 'utf8'))
    const counts = imports.reduce((acc, specifier) => {
      const kind = classify(specifier)
      acc[kind] = (acc[kind] ?? 0) + 1
      return acc
    }, {})
    return {
      file: relative(root, file),
      imports: imports.length,
      publicPackageImports: counts['mol-viewer-public'] ?? 0,
      viewerAdapterImports: counts['viewer-adapter'] ?? 0,
      internalStoreImports: counts['viewer-store-internal'] ?? 0,
      localImports: (counts['app-local'] ?? 0) + (counts['relative-local'] ?? 0),
    }
  })

  const highImportFiles = [...rows].sort((a, b) => b.imports - a.imports).slice(0, 15)
  const viewerTouchFiles = rows.filter(row => row.viewerAdapterImports > 0 || row.internalStoreImports > 0)

  console.log(`\n${name}`)
  console.log(`files: ${rows.length}`)
  console.log(`files touching viewer state: ${viewerTouchFiles.length}`)
  console.table(highImportFiles)
}
