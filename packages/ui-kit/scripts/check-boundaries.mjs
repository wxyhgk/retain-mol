import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'

/**
 * ui-kit 是无业务语义的共享 UI 层:
 * - 禁止 app 别名 '@/'
 * - 禁止相对路径逃出 src
 * - 禁止任何 @retainmol/* 业务包导入(包括 mol-viewer)
 */
const ALLOWED_MOL_VIEWER_SUBPATHS = new Set()
const ALLOWED_SIBLING_PACKAGES = new Set()
const THIRD_PARTY_ADAPTERS = new Map([
  ['@tanstack/react-table', 'data/DataTable.tsx'],
  ['react-virtuoso', 'data/VirtualList.tsx'],
  ['react-dropzone', 'data/FileDropzone.tsx'],
])

const SRC_DIR = new URL('../src', import.meta.url).pathname

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = `${dir}/${entry}`
    if (statSync(path).isDirectory()) out.push(...walk(path))
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

const violations = []
for (const file of walk(SRC_DIR)) {
  const rel = file.slice(SRC_DIR.length + 1)
  const source = readFileSync(file, 'utf8')
  if (/\bimport\.meta\.env(?:\.|\[)/.test(source)) {
    violations.push(`${rel}: ui-kit 不得读取 import.meta.env`)
  }
  if (/\bfetch\s*\(/.test(source)) {
    violations.push(`${rel}: ui-kit 不得发起网络请求`)
  }
  if (/\b(?:document\.cookie\s*=|localStorage\.|sessionStorage\.|indexedDB\.)/.test(source)) {
    violations.push(`${rel}: ui-kit 不得直接持久化状态`)
  }
  for (const specifier of collectModuleSpecifiers(source)) {
    if (specifier.startsWith('@/')) {
      violations.push(`${rel}: 禁止使用 app 别名 '@/',包内用相对导入`)
    }
    if (specifier.startsWith('.')) {
      const target = resolve(dirname(file), specifier)
      if (target !== SRC_DIR && !target.startsWith(SRC_DIR + sep)) {
        violations.push(`${rel}: 相对导入 ${specifier} 逃出了包 src`)
      }
    }
    if (specifier === '@retainmol/mol-viewer' || specifier.startsWith('@retainmol/mol-viewer/')) {
      if (!ALLOWED_MOL_VIEWER_SUBPATHS.has(specifier)) {
        violations.push(`${rel}: mol-viewer 导入 ${specifier} 不在允许清单`)
      }
    }
    const siblingMatch = specifier.match(/^(@retainmol\/(?:jobs|molecule-assets|ui-kit))(\/.*)?$/)
    if (siblingMatch) {
      if (siblingMatch[2]) {
        violations.push(`${rel}: 只允许兄弟包根导入,禁止深入 ${specifier}`)
      } else if (!ALLOWED_SIBLING_PACKAGES.has(siblingMatch[1])) {
        violations.push(`${rel}: 不允许依赖 ${siblingMatch[1]}`)
      }
    }
    for (const [packageName, adapter] of THIRD_PARTY_ADAPTERS) {
      if (
        (specifier === packageName || specifier.startsWith(`${packageName}/`))
        && rel !== adapter
      ) {
        violations.push(`${rel}: ${packageName} 只能通过 ${adapter} 导入`)
      }
    }
  }
}

if (violations.length > 0) {
  console.error('Boundary violations:')
  for (const violation of violations) console.error(`  ${violation}`)
  process.exit(1)
}
console.log('Boundary check passed.')
