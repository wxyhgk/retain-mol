import { describe, expect, it } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { buildEntityRows, queryEntityRows, ENTITY_PAGE_SIZE } from './entityBrowser'
const molecule: Molecule = {
  atoms: Array.from({ length: 100 }, (_, i) => ({ id: `oxygen-in-id-${i}`, symbol: i % 10 === 0 ? 'O' : 'C', label: i === 50 ? 'reaction center' : undefined, x: i, y: 0, z: 0 })),
  bonds: Array.from({ length: 99 }, (_, i) => ({ id: `bond-${i}`, atomId1: `oxygen-in-id-${i}`, atomId2: `oxygen-in-id-${i + 1}`, order: 1 })),
}
const rows = buildEntityRows(molecule, 'atom', new Set(['oxygen-in-id-50']), new Set())
describe('entity browser queries', () => {
  it('paginates 100 atoms while preserving stable IDs', () => {
    const pages = Array.from({ length: 5 }, (_, page) => queryEntityRows(rows, '', false, page))
    expect(pages.every(page => page.rows.length === ENTITY_PAGE_SIZE && page.pageCount === 5 && page.total === 100)).toBe(true)
    expect(pages.flatMap(page => page.rows.map(row => row.id))).toEqual(molecule.atoms.map(atom => atom.id))
  })
  it('matches exact elements rather than letters in random IDs', () => {
    expect(queryEntityRows(rows, 'o', false, 0).total).toBe(10)
    expect(queryEntityRows(rows, 'Cl', false, 0).total).toBe(0)
    expect(queryEntityRows(rows, '#12', false, 0).rows[0]?.id).toBe('oxygen-in-id-11')
    expect(queryEntityRows(rows, '12', false, 0).total).toBe(1)
  })
  it('supports complete ID, labels, selected-only and clamps after filtering', () => {
    expect(queryEntityRows(rows, 'id:oxygen-in-id-50', false, 4)).toMatchObject({ page: 0, total: 1, rows: [{ id: 'oxygen-in-id-50' }] })
    expect(queryEntityRows(rows, 'id:oxygen-in-id-', false, 0).total).toBe(0)
    expect(queryEntityRows(rows, 'reaction', false, 0).rows[0]?.id).toBe('oxygen-in-id-50')
    expect(queryEntityRows(rows, '', true, 4).rows.map(row => row.id)).toEqual(['oxygen-in-id-50'])
    expect(queryEntityRows(rows, 'N', false, 4)).toMatchObject({ page: 0, pageCount: 1, total: 0, rows: [] })
  })
  it('renumbers labels after deletion while retaining entity identity', () => {
    const next = buildEntityRows({ ...molecule, atoms: molecule.atoms.slice(1) }, 'atom', new Set(), new Set())
    expect(queryEntityRows(next, '#12', false, 0).rows[0]?.id).toBe('oxygen-in-id-12')
    expect(queryEntityRows(next, 'id:oxygen-in-id-11', false, 0).rows[0]?.number).toBe(11)
  })
  it('keeps stable ID matching case sensitive', () => {
    const mixed = [{ ...rows[0]!, id: 'atom-A' }, { ...rows[1]!, id: 'atom-a' }]
    expect(queryEntityRows(mixed, 'id:atom-A', false, 0).rows.map(row => row.id)).toEqual(['atom-A'])
    expect(queryEntityRows(mixed, 'ID:atom-a', false, 0).rows.map(row => row.id)).toEqual(['atom-a'])
  })
  it('searches bonds by endpoint element and uses bond selection separately', () => {
    const bonds = buildEntityRows(molecule, 'bond', new Set(['oxygen-in-id-0']), new Set(['bond-10']))
    expect(queryEntityRows(bonds, '', true, 0).rows.map(row => row.id)).toEqual(['bond-10'])
    expect(queryEntityRows(bonds, 'O', false, 0).total).toBe(19)
    expect(queryEntityRows(bonds, '#1', false, 0).rows[0]).toMatchObject({ id: 'bond-0', label: '键 #1 · O #1—C #2 · 1 级' })
  })
})
