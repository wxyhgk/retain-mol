import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import ts from 'typescript'

/** Read syntax rather than comments or import-like strings. Keep type edges separate. */
export function readImports(source, file = 'module.ts') {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  const imports = []
  const add = (node, specifier, typeOnly) => imports.push({
    specifier,
    typeOnly,
    line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
  })
  const literal = node => node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
  const visit = node => {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause
      const bindings = clause?.namedBindings
      const typeOnly = Boolean(clause?.isTypeOnly || (
        !clause?.name && bindings && ts.isNamedImports(bindings)
        && bindings.elements.length > 0 && bindings.elements.every(element => element.isTypeOnly)
      ))
      add(node, node.moduleSpecifier.text, typeOnly)
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const clause = node.exportClause
      add(node, node.moduleSpecifier.text, Boolean(node.isTypeOnly || (
        clause && ts.isNamedExports(clause) && clause.elements.length > 0
        && clause.elements.every(element => element.isTypeOnly)
      )))
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      add(node, node.argument.literal.text, true)
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      add(node, node.moduleReference.expression.text, Boolean(node.isTypeOnly))
    } else if (ts.isCallExpression(node) && (
      node.expression.kind === ts.SyntaxKind.ImportKeyword
      || (ts.isIdentifier(node.expression) && node.expression.text === 'require')
    )) {
      // An unresolvable dynamic dependency must not silently pass a pure-entry check.
      add(node, literal(node.arguments[0]) ? node.arguments[0].text : null, false)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return imports
}

function resolveLocal(root, file, specifier) {
  if (specifier === null) return null
  const base = specifier.startsWith('@/') ? resolve(root, specifier.slice(2))
    : specifier.startsWith('.') ? resolve(dirname(file), specifier) : null
  if (!base) return null
  const candidates = [base, ...['.ts', '.tsx', '.js', '.mjs', '.json'].map(ext => base + ext),
    ...['index.ts', 'index.tsx', 'index.js', 'index.mjs'].map(name => join(base, name))]
  if (extname(base) === '.js') candidates.push(base.slice(0, -3) + '.ts', base.slice(0, -3) + '.tsx')
  const target = candidates.find(candidate => existsSync(candidate) && statSync(candidate).isFile())
  if (!target) throw new Error(`${relative(root, file)}: unresolved local module ${specifier}`)
  return target
}

export function buildModuleGraph(root, { built = false } = {}) {
  root = resolve(root)
  const graph = new Map()
  const visit = file => {
    if (graph.has(file)) return
    const edges = /\.(tsx?|m?js)$/.test(file) ? readImports(readFileSync(file, 'utf8'), file)
      .map(edge => ({ ...edge, target: resolveLocal(root, file, edge.specifier) }))
      : []
    graph.set(file, edges)
    for (const edge of edges) if (edge.target) visit(edge.target)
  }
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name)
      if (entry.isDirectory()) walk(file)
      else if (built ? /\.m?js$/.test(file) : /\.tsx?$/.test(file) && !/\.(test|bench|d)\.tsx?$/.test(file)) visit(file)
    }
  }
  walk(root)
  return graph
}

/** Follow value imports, re-exports and literal dynamic imports transitively. */
export function runtimeClosure(graph, entry) {
  const files = new Set()
  const dependencies = []
  const visit = file => {
    if (files.has(file)) return
    files.add(file)
    for (const edge of graph.get(file) ?? []) {
      if (edge.typeOnly) continue
      if (edge.target) visit(edge.target)
      else dependencies.push({ ...edge, file })
    }
  }
  visit(entry)
  return { files, dependencies }
}

/** Runtime cycles only; type-only references do not initialize modules. */
export function runtimeCycles(graph) {
  let next = 0
  const ids = new Map(), low = new Map(), stack = [], active = new Set(), cycles = []
  const visit = file => {
    ids.set(file, next)
    low.set(file, next++)
    stack.push(file)
    active.add(file)
    for (const edge of graph.get(file) ?? []) {
      if (edge.typeOnly || !edge.target) continue
      if (!ids.has(edge.target)) {
        visit(edge.target)
        low.set(file, Math.min(low.get(file), low.get(edge.target)))
      } else if (active.has(edge.target)) low.set(file, Math.min(low.get(file), ids.get(edge.target)))
    }
    if (low.get(file) !== ids.get(file)) return
    const component = []
    let member
    do {
      member = stack.pop()
      active.delete(member)
      component.push(member)
    } while (member !== file)
    if (component.length > 1 || (graph.get(file) ?? []).some(edge => !edge.typeOnly && edge.target === file)) cycles.push(component)
  }
  for (const file of graph.keys()) if (!ids.has(file)) visit(file)
  return cycles
}

// Existing public entries only. /modeling still includes runtime adapters.
export const PURE_ENTRY_DEPENDENCIES = {
  core: ['openchemlib'],
  io: ['openchemlib'],
  geometry: [],
  graph: [],
}

/** Foundation ownership includes type edges: a store type is still an upward dependency. */
export function checkFoundations(graph, root) {
  const violations = []
  const rel = file => relative(root, file).replaceAll('\\', '/')
  const legacy = new Set(['lib/types.ts', 'lib/builder/graph.ts',
    'lib/builder/analysis/fragments.ts', 'lib/moleculeValidation.ts'])
  const rules = [
    ['lib/model/', ['lib/model/']],
    ['lib/graph/', ['lib/model/', 'lib/graph/']],
    ['lib/presentation/', ['lib/model/', 'lib/presentation/']],
    ['lib/clipboard.ts', ['lib/model/']],
  ]
  for (const [file, edges] of graph) for (const edge of edges) {
    const from = rel(file)
    if (edge.target && legacy.has(rel(edge.target))) {
      violations.push(`${from}:${edge.line}: import the owning module instead of compatibility facade "${rel(edge.target)}"`)
    }
    for (const [owner, allowed] of rules) {
      if (!from.startsWith(owner)) continue
      if (!edge.target || !allowed.some(prefix => rel(edge.target).startsWith(prefix))) {
        violations.push(`${from}:${edge.line}: foundation module must not depend on "${edge.specifier ?? '<non-literal import>'}" (including type imports)`)
      }
    }
  }
  return violations
}

export function checkPureEntries(graph, root, { built = false } = {}) {
  const violations = []
  for (const [name, allowed] of Object.entries(PURE_ENTRY_DEPENDENCIES)) {
    const entry = resolve(root, `public/${name}.${built ? 'js' : 'ts'}`)
    if (!graph.has(entry)) {
      violations.push(`Missing pure entry: ${name}`)
      continue
    }
    const closure = runtimeClosure(graph, entry)
    for (const file of closure.files) {
      if (!/\.(tsx?|m?js|json)$/.test(file)) violations.push(`${name}: non-code runtime dependency ${relative(root, file)}`)
    }
    for (const edge of closure.dependencies) {
      if (!allowed.some(dep => edge.specifier === dep || edge.specifier?.startsWith(`${dep}/`))) {
        violations.push(`${name}: ${relative(root, edge.file)}:${edge.line} loads forbidden dependency ${edge.specifier ?? '<non-literal import>'}`)
      }
    }
    if (!built) for (const file of closure.files) {
      if (/^(components|hooks|store|runtime|lib\/molRenderer)\//.test(relative(root, file).replaceAll('\\', '/'))) {
        violations.push(`${name}: runtime dependency on upper layer ${relative(root, file)}`)
      }
    }
  }
  return violations
}
