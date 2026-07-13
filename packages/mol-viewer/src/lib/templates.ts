import { centerMolecule, type Molecule } from './molecule'
import { SAMPLE_MOLECULES } from './samples'

export type MoleculeTemplateCategory = 'small' | 'organic' | 'ring'

export interface MoleculeTemplateDef {
  readonly id: string
  readonly name: string
  readonly formula: string
  readonly category: MoleculeTemplateCategory
  readonly description?: string
  readonly source: 'builtin'
  readonly mol: () => Molecule
}

export interface MoleculeTemplateSummary {
  readonly id: string
  readonly name: string
  readonly formula: string
  readonly category: MoleculeTemplateCategory
  readonly description?: string
  readonly source: 'builtin'
  readonly atomCount: number
  readonly bondCount: number
}

const bySampleName = new Map(SAMPLE_MOLECULES.map(sample => [sample.name, sample.mol]))

function sampleMol(name: string) {
  const mol = bySampleName.get(name)
  if (!mol) throw new Error(`Missing sample molecule for template: ${name}`)
  return mol
}

export const MOLECULE_TEMPLATES: readonly MoleculeTemplateDef[] = [
  {
    id: 'water',
    name: '水',
    formula: 'H2O',
    category: 'small',
    description: '常用小分子模板',
    source: 'builtin',
    mol: sampleMol('水 (H₂O)'),
  },
  {
    id: 'methane',
    name: '甲烷',
    formula: 'CH4',
    category: 'small',
    description: '四面体 sp3 碳模板',
    source: 'builtin',
    mol: sampleMol('甲烷 (CH₄)'),
  },
  {
    id: 'ethanol',
    name: '乙醇',
    formula: 'C2H5OH',
    category: 'organic',
    description: '基础有机分子模板',
    source: 'builtin',
    mol: sampleMol('乙醇 (C₂H₅OH)'),
  },
  {
    id: 'benzene',
    name: '苯',
    formula: 'C6H6',
    category: 'ring',
    description: '芳香六元环模板',
    source: 'builtin',
    mol: sampleMol('苯 (C₆H₆)'),
  },
  {
    id: 'carbon-dioxide',
    name: '二氧化碳',
    formula: 'CO2',
    category: 'small',
    description: '线性小分子模板',
    source: 'builtin',
    mol: sampleMol('CO₂'),
  },
  {
    id: 'ammonia',
    name: '氨',
    formula: 'NH3',
    category: 'small',
    description: '三角锥小分子模板',
    source: 'builtin',
    mol: sampleMol('氨 (NH₃)'),
  },
]

function cloneMolecule(molecule: Molecule): Molecule {
  return {
    ...molecule,
    atoms: molecule.atoms.map(atom => ({ ...atom })),
    bonds: molecule.bonds.map(bond => ({ ...bond })),
  }
}

export function listMoleculeTemplates(): readonly MoleculeTemplateDef[] {
  return MOLECULE_TEMPLATES.map(template => ({ ...template }))
}

export function listMoleculeTemplateSummaries(): readonly MoleculeTemplateSummary[] {
  return MOLECULE_TEMPLATES.map(template => {
    const molecule = template.mol()
    return {
      id: template.id,
      name: template.name,
      formula: template.formula,
      category: template.category,
      ...(template.description === undefined ? {} : { description: template.description }),
      source: template.source,
      atomCount: molecule.atoms.length,
      bondCount: molecule.bonds.length,
    }
  })
}

export function getMoleculeTemplate(id: string): MoleculeTemplateDef | undefined {
  const template = MOLECULE_TEMPLATES.find(item => item.id === id)
  return template ? { ...template } : undefined
}

export function createMoleculeFromTemplate(id: string): Molecule | undefined {
  const template = getMoleculeTemplate(id)
  return template ? cloneMolecule(template.mol()) : undefined
}

export function createCenteredMoleculeFromTemplate(id: string): Molecule | undefined {
  const molecule = createMoleculeFromTemplate(id)
  return molecule ? centerMolecule(molecule) : undefined
}

export function validateMoleculeTemplate(template: MoleculeTemplateDef): string[] {
  const errors: string[] = []
  const molecule = template.mol()
  const atomIds = new Set<string>()
  const bondKeys = new Set<string>()

  if (!template.id.trim()) errors.push('template id is required')
  if (!template.name.trim()) errors.push(`template ${template.id} name is required`)
  if (!template.formula.trim()) errors.push(`template ${template.id} formula is required`)
  if (molecule.atoms.length === 0) errors.push(`template ${template.id} has no atoms`)

  for (const atom of molecule.atoms) {
    if (!atom.id) errors.push(`template ${template.id} has atom without id`)
    if (atomIds.has(atom.id)) errors.push(`template ${template.id} has duplicate atom id: ${atom.id}`)
    atomIds.add(atom.id)
    if (!atom.symbol.trim()) errors.push(`template ${template.id} has atom without symbol`)
    if (!Number.isFinite(atom.x) || !Number.isFinite(atom.y) || !Number.isFinite(atom.z)) {
      errors.push(`template ${template.id} has non-finite atom coordinate: ${atom.id}`)
    }
  }

  for (const bond of molecule.bonds) {
    if (!bond.id) errors.push(`template ${template.id} has bond without id`)
    if (bond.atomId1 === bond.atomId2) errors.push(`template ${template.id} has self-loop bond: ${bond.id}`)
    if (!atomIds.has(bond.atomId1) || !atomIds.has(bond.atomId2)) {
      errors.push(`template ${template.id} has dangling bond: ${bond.id}`)
    }
    const key = [bond.atomId1, bond.atomId2].sort().join('::')
    if (bondKeys.has(key)) errors.push(`template ${template.id} has duplicate bond: ${key}`)
    bondKeys.add(key)
    if (bond.order !== 1 && bond.order !== 2 && bond.order !== 3) {
      errors.push(`template ${template.id} has invalid bond order: ${bond.id}`)
    }
  }

  return errors
}
