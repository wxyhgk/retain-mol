import {
  centerMolecule,
  COMMON_ELEMENT_SYMBOLS,
  getMolecularFormula,
  getElementConfig,
  type Molecule,
} from '@retainmol/mol-viewer/core'
import { listFragments } from '@retainmol/mol-viewer/fragments'
import {
  createCenteredMoleculeFromTemplate,
  listMoleculeTemplates,
} from '@retainmol/mol-viewer/templates'
import { cloneTemplateMolecule } from '@retainmol/mol-viewer/templates'

export const COMMON_HYBRID_IDS = ['c-sp3', 'c-sp2', 'c-sp', 'n-sp3', 'n-sp2', 'n-sp', 'o-sp3', 'o-sp2', 's-sp3', 's-sp2']
export const COMMON_ATOMS = ['C', 'H', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I']
export const COMMON_ELEMENTS = new Set<string>(COMMON_ELEMENT_SYMBOLS)

export const BUILD_FRAGMENTS = listFragments()
export const RING_FRAGMENTS = BUILD_FRAGMENTS.filter(fragment => fragment.group === 'ring')

export const HYBRID_GROUPS = new Set(['sp3', 'sp2', 'sp'])
export const HYBRID_GROUP_ORDER: Record<string, number> = { sp3: 0, sp2: 1, sp: 2 }
export const HYBRID_GROUP_LABEL: Record<string, string> = { sp3: 'sp³', sp2: 'sp²', sp: 'sp' }

export type TemplateMolecule = Molecule

export interface CanvasTemplateSummary {
  readonly id: string
  readonly name: string
  readonly formula: string
  readonly description?: string
  readonly source: 'builtin' | 'workspace'
  readonly molecule?: Molecule
}

export interface WorkspaceTemplateDraft {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly molecule: Molecule
}

export function toElementHex(color: number) {
  return '#' + color.toString(16).padStart(6, '0')
}

export function getElementHex(symbol: string) {
  return toElementHex(getElementConfig(symbol).color)
}

export function getHybridFragmentsForElement(symbol: string) {
  return BUILD_FRAGMENTS
    .filter(fragment => fragment.atoms[fragment.attachIndex]?.symbol === symbol && HYBRID_GROUPS.has(fragment.group ?? ''))
    .sort((a, b) => (HYBRID_GROUP_ORDER[a.group ?? ''] ?? 9) - (HYBRID_GROUP_ORDER[b.group ?? ''] ?? 9))
}

export function getBuildFragmentsForElement(symbol: string) {
  return BUILD_FRAGMENTS
    .filter(fragment => {
      if (fragment.atoms[fragment.attachIndex]?.symbol !== symbol) return false
      return HYBRID_GROUPS.has(fragment.group ?? '') || fragment.group === 'coordination'
    })
    .sort((a, b) => {
      if (a.group === 'coordination' && b.group === 'coordination') {
        return (a.coordination?.coordinationNumber ?? 0) - (b.coordination?.coordinationNumber ?? 0)
      }
      return (HYBRID_GROUP_ORDER[a.group ?? ''] ?? 9) - (HYBRID_GROUP_ORDER[b.group ?? ''] ?? 9)
    })
}

export function createCanvasMoleculeFromTemplate(id: string, drafts: readonly WorkspaceTemplateDraft[] = []): Molecule | undefined {
  if (!id.startsWith('workspace:')) return createCenteredMoleculeFromTemplate(id)
  const draft = drafts.find(item => item.id === id.slice('workspace:'.length))
  return draft ? centerMolecule(cloneTemplateMolecule(draft.molecule)) : undefined
}

export function listCanvasTemplates(drafts: readonly WorkspaceTemplateDraft[] = []): readonly CanvasTemplateSummary[] {
  const builtin = listMoleculeTemplates().map(template => ({
    id: template.id,
    name: template.name,
    formula: template.formula,
    description: template.description,
    source: 'builtin' as const,
    molecule: createCenteredMoleculeFromTemplate(template.id),
  }))
  const workspace = drafts.map(draft => ({
    id: `workspace:${draft.id}`,
    name: draft.name,
    formula: getMolecularFormula(draft.molecule.atoms),
    description: draft.description,
    source: 'workspace' as const,
    molecule: cloneTemplateMolecule(draft.molecule),
  }))
  return [...workspace, ...builtin]
}
