import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC_DIR = new URL('../src', import.meta.url).pathname
const allowedMolViewerImports = new Set([
  '@retainmol/mol-viewer/core',
  '@retainmol/mol-viewer/fragments',
  '@retainmol/mol-viewer/io',
  '@retainmol/mol-viewer/optimize',
  '@retainmol/mol-viewer/pubchem',
  '@retainmol/mol-viewer/samples',
  '@retainmol/mol-viewer/styles',
  '@retainmol/mol-viewer/viewer',
])

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) out.push(...walk(path))
    else if (/\.(ts|tsx)$/.test(entry)) out.push(path)
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

const violations = []

for (const file of walk(SRC_DIR)) {
  const rel = relative(SRC_DIR, file)
  const source = readFileSync(file, 'utf8')
  const imports = collectImports(source)

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
  }
}

if (violations.length > 0) {
  console.error('Boundary check failed:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log('Boundary check passed.')
