import {
  COMMON_ELEMENT_SYMBOLS,
  getElementConfig,
  type Molecule,
} from '@retainmol/mol-viewer/core'
import { listFragments } from '@retainmol/mol-viewer/fragments'
import {
  createCenteredMoleculeFromTemplate,
  listMoleculeTemplates,
  type MoleculeTemplateDef,
} from '@retainmol/mol-viewer/templates'

export const COMMON_HYBRID_IDS = ['c-sp3', 'c-sp2', 'c-sp', 'n-sp3', 'n-sp2', 'n-sp', 'o-sp3', 'o-sp2', 's-sp3', 's-sp2']
export const COMMON_ATOMS = ['C', 'H', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I']
export const COMMON_ELEMENTS = new Set<string>(COMMON_ELEMENT_SYMBOLS)

export const BUILD_FRAGMENTS = listFragments()
export const RING_FRAGMENTS = BUILD_FRAGMENTS.filter(fragment => fragment.group === 'ring')

export const HYBRID_GROUPS = new Set(['sp3', 'sp2', 'sp'])
export const HYBRID_GROUP_ORDER: Record<string, number> = { sp3: 0, sp2: 1, sp: 2 }
export const HYBRID_GROUP_LABEL: Record<string, string> = { sp3: 'sp³', sp2: 'sp²', sp: 'sp' }

export const TEMPLATE_MOLECULES = listMoleculeTemplates()

export type TemplateMolecule = Molecule
export type TemplateMoleculeDef = MoleculeTemplateDef

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

export function createCanvasMoleculeFromTemplate(id: string): Molecule | undefined {
  return createCenteredMoleculeFromTemplate(id)
}
