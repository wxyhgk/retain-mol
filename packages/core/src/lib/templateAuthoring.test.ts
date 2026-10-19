import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from './molecule'
import {
  createAtomAttachmentSite,
  createEdgeAttachmentSite,
  createFragmentFromTemplateSite,
  createTemplateDraft,
  validateTemplateDraft,
} from './templateAuthoring'
import { attachFragmentToAtom } from './builder/editing/fragment/attach'

function molecule() {
  const a = newAtom('C')
  const b = newAtom('C', 1.4)
  const h = newAtom('H', -1.09)
  const bond = newBond(a.id, b.id, 1)
  const hydrogenBond = newBond(a.id, h.id, 1)
  return { name: 'test', atoms: [a, b, h], bonds: [bond, hydrogenBond] }
}

describe('template authoring', () => {
  it('accepts a molecule-only template without authored attachment sites', () => {
    const draft = createTemplateDraft({ id: 'benzene', name: '苯', molecule: molecule() })
    expect(validateTemplateDraft(draft)).toEqual([])
    expect(draft.attachmentSites).toEqual([])
  })

  it('accepts atom and edge attachment sites that reference the template graph', () => {
    const mol = molecule()
    const draft = createTemplateDraft({
      id: 'fluorene',
      name: '芴',
      molecule: mol,
      attachmentSites: [
        createAtomAttachmentSite({ id: 'atom-1', name: '原子位点 1', atomId: mol.atoms[0].id }),
        createEdgeAttachmentSite({
          id: 'edge-1',
          name: '并环边 1',
          bondId: mol.bonds[0].id,
          atomIds: [mol.atoms[0].id, mol.atoms[1].id],
        }),
      ],
    })

    expect(validateTemplateDraft(draft)).toEqual([])
  })

  it('rejects stale graph references and duplicate site ids', () => {
    const mol = molecule()
    const draft = createTemplateDraft({
      id: 'invalid',
      name: 'Invalid',
      molecule: mol,
      attachmentSites: [
        createAtomAttachmentSite({ id: 'site', name: 'A', atomId: 'missing' }),
        createAtomAttachmentSite({ id: 'site', name: 'B', atomId: mol.atoms[0].id }),
      ],
    })

    expect(validateTemplateDraft(draft).map(issue => issue.code)).toEqual([
      'missing-anchor-atom',
      'duplicate-site-id',
    ])
  })

  it('rejects duplicate ids, dangling/self/duplicate bonds, invalid coordinates and excess valence', () => {
    const carbon = newAtom('C')
    const duplicate = { ...newAtom('C', 1), id: carbon.id }
    const invalid = createTemplateDraft({
      id: 'invalid-graph',
      name: 'Invalid graph',
      molecule: {
        atoms: [carbon, duplicate, { ...newAtom('H'), id: 'h', x: Number.NaN }],
        bonds: [
          newBond(carbon.id, 'missing'),
          newBond(carbon.id, carbon.id),
          newBond(carbon.id, 'h', 3),
          newBond(carbon.id, 'h', 3),
        ],
      },
    })

    const codes = new Set(validateTemplateDraft(invalid).map(issue => issue.code))
    expect([...codes]).toEqual(expect.arrayContaining([
      'duplicate-atom-id',
      'invalid-coordinate',
      'dangling-bond',
      'self-bond',
      'duplicate-bond',
    ]))
  })

  it('rejects an otherwise connected graph with excess bond valence', () => {
    const carbon = newAtom('C')
    const neighbors = Array.from({ length: 5 }, (_, index) => newAtom('H', index + 1))
    const draft = createTemplateDraft({
      id: 'excess-valence',
      name: 'Excess valence',
      molecule: {
        atoms: [carbon, ...neighbors],
        bonds: neighbors.map(atom => newBond(carbon.id, atom.id)),
      },
    })

    expect(validateTemplateDraft(draft).map(issue => issue.code)).toContain('excess-valence')
  })

  it('compiles an atom site into the established fragment attachment algorithm', () => {
    const template = molecule()
    const hostCarbon = newAtom('C', 4, 0, 0)
    const hostHydrogen = newAtom('H', 5.09, 0, 0)
    const host = {
      name: 'host',
      atoms: [hostCarbon, hostHydrogen],
      bonds: [newBond(hostCarbon.id, hostHydrogen.id)],
    }
    const draft = createTemplateDraft({
      id: 'attachable',
      name: 'Attachable',
      molecule: template,
      attachmentSites: [createAtomAttachmentSite({
        id: 'atom-1',
        name: 'Atom 1',
        atomId: template.atoms[0].id,
      })],
    })

    const fragment = createFragmentFromTemplateSite(draft, 'atom-1')
    const result = attachFragmentToAtom(host, fragment, hostCarbon.id)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.atoms.filter(atom => atom.symbol === 'C')).toHaveLength(3)
    expect(result.molecule.bonds.some(bond => bond.atomId1 === hostCarbon.id || bond.atomId2 === hostCarbon.id)).toBe(true)
  })

  it('allows an authored atom site without an explicit leaving hydrogen', () => {
    const carbon = newAtom('C')
    const neighbor = newAtom('C', -1.4)
    const openValence = { atoms: [carbon, neighbor], bonds: [newBond(carbon.id, neighbor.id)] }
    const draft = createTemplateDraft({
      id: 'open-valence',
      name: 'Open valence',
      molecule: openValence,
      attachmentSites: [createAtomAttachmentSite({ id: 'atom-1', name: 'Atom 1', atomId: carbon.id })],
    })

    expect(validateTemplateDraft(draft)).toEqual([])
    expect(createFragmentFromTemplateSite(draft, 'atom-1')).toMatchObject({
      attachHIndex: -1,
      attachDirection: [1, 0, 0],
    })
  })

  it('treats a selected hydrogen site as a leaving atom instead of a bond anchor', () => {
    const carbon = newAtom('C')
    const hydrogen = newAtom('H', 1.09)
    const moleculeWithHydrogen = { atoms: [carbon, hydrogen], bonds: [newBond(carbon.id, hydrogen.id)] }
    const draft = createTemplateDraft({
      id: 'hydrogen-site',
      name: 'Hydrogen site',
      molecule: moleculeWithHydrogen,
      attachmentSites: [createAtomAttachmentSite({ id: 'atom-1', name: 'H site', atomId: hydrogen.id })],
    })

    expect(validateTemplateDraft(draft)).toEqual([])
    const fragment = createFragmentFromTemplateSite(draft, 'atom-1')
    expect(fragment).toMatchObject({
      attachIndex: 0,
      attachHIndex: 1,
    })
    const hostCarbon = newAtom('C', 4)
    const hostHydrogen = newAtom('H', 5.09)
    const result = attachFragmentToAtom({
      atoms: [hostCarbon, hostHydrogen],
      bonds: [newBond(hostCarbon.id, hostHydrogen.id)],
    }, fragment, hostHydrogen.id)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.atoms.map(atom => atom.symbol)).toEqual(['C', 'C'])
    expect(result.molecule.bonds).toHaveLength(1)
  })
})
