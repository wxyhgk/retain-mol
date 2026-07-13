import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, normalize, relative, resolve } from 'node:path'

const srcDir = resolve(import.meta.dirname, '../src')

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) files.push(...walk(path))
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) files.push(path)
  }
  return files
}

function moduleSpecifiers(source) {
  const specifiers = []
  const patterns = [
    /\bimport(?:\s+type)?[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bexport(?:\s+type)?[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/g,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(source))) specifiers.push(match[1])
  }
  return specifiers
}

function rel(path) {
  return relative(srcDir, path).replaceAll('\\', '/')
}

function resolveLocal(file, specifier) {
  if (specifier.startsWith('@/')) return normalize(resolve(srcDir, specifier.slice(2)))
  if (!specifier.startsWith('.')) return null
  return normalize(resolve(dirname(file), specifier))
}

const violations = []

for (const file of walk(srcDir)) {
  const fileRel = rel(file)
  const source = readFileSync(file, 'utf8')
  const imports = moduleSpecifiers(source)

  if (fileRel.startsWith('lib/builder/')) {
    for (const specifier of imports) {
      if (specifier === 'three' || specifier.startsWith('three/')) {
        violations.push(`${fileRel}: Builder must use pure vector/transform DTOs, not Three.js`)
      }

      const target = resolveLocal(file, specifier)
      if (!target) continue
      const targetRel = rel(target)
      if (
        targetRel.startsWith('lib/molRenderer/')
        || targetRel.startsWith('hooks/')
        || targetRel.startsWith('components/')
        || targetRel.startsWith('store/')
      ) {
        violations.push(`${fileRel}: Builder must not depend on upper layer "${targetRel}"`)
      }
    }
  }

  if (!fileRel.startsWith('lib/molRenderer/')) {
    for (const specifier of imports) {
      const target = resolveLocal(file, specifier)
      if (target && rel(target) === 'lib/molRenderer/MolRenderer') {
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
      if (specifier !== '../../types') {
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

console.log('mol-viewer boundaries passed (Builder, Renderer, and declarative Style directions enforced).')
