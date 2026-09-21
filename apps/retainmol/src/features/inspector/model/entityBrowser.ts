import type { Molecule } from '@retainmol/mol-viewer/core'

export const ENTITY_PAGE_SIZE = 20
export interface EntityRow {
  readonly kind: 'atom' | 'bond'
  readonly id: string
  readonly number: number
  readonly label: string
  readonly symbols: readonly string[]
  readonly selected: boolean
}

export function buildEntityRows(molecule: Molecule, kind: EntityRow['kind'], atoms: ReadonlySet<string>, bonds: ReadonlySet<string>): EntityRow[] {
  if (kind === 'atom') return molecule.atoms.map((atom, index) => ({
    kind, id: atom.id, number: index + 1, label: `${atom.symbol} #${index + 1}${atom.label ? ` · ${atom.label}` : ''}`,
    symbols: [atom.symbol], selected: atoms.has(atom.id),
  }))
  const byId = new Map(molecule.atoms.map((atom, index) => [atom.id, { atom, number: index + 1 }]))
  return molecule.bonds.map((bond, index) => {
    const first = byId.get(bond.atomId1)
    const second = byId.get(bond.atomId2)
    return {
      kind, id: bond.id, number: index + 1,
      label: `键 #${index + 1} · ${first?.atom.symbol ?? '?'} #${first?.number ?? '?'}—${second?.atom.symbol ?? '?'} #${second?.number ?? '?'} · ${bond.order} 级`,
      symbols: [first?.atom.symbol ?? '', second?.atom.symbol ?? ''], selected: bonds.has(bond.id),
    }
  })
}

/** Elements match exactly; stable IDs require id: to avoid random ID substring matches. */
export function queryEntityRows(rows: readonly EntityRow[], query: string, selectedOnly: boolean, requestedPage: number) {
  const text = query.trim()
  const term = text.toLowerCase()
  const matches = rows.filter(row => {
    if (selectedOnly && !row.selected) return false
    if (!term) return true
    if (term.startsWith('id:')) return row.id === text.slice(3).trim()
    if (/^#?\d+$/.test(term)) return row.number === Number(term.replace('#', ''))
    if (/^[a-z]{1,2}$/.test(term)) return row.symbols.some(symbol => symbol.toLowerCase() === term)
    return row.label.toLowerCase().includes(term)
  })
  const pageCount = Math.max(1, Math.ceil(matches.length / ENTITY_PAGE_SIZE))
  const page = Math.max(0, Math.min(Math.trunc(requestedPage) || 0, pageCount - 1))
  return { total: matches.length, pageCount, page, rows: matches.slice(page * ENTITY_PAGE_SIZE, (page + 1) * ENTITY_PAGE_SIZE) }
}
