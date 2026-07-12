import type { Molecule } from './molecule'
import { getMolecularFormula } from './chemistry'
import type { FragmentDef } from './builder/fragmentLibrary'
import { getElementConfig } from '../config/elements.config'
import { maxValence, valenceUsed } from './builder/valence'

export type TemplateDraftCategory = 'fragment' | 'ring' | 'functional-group' | 'molecule'

interface AttachmentSiteBase {
  readonly id: string
  readonly name: string
  readonly leavingAtomIds: readonly string[]
}

export interface AtomAttachmentSite extends AttachmentSiteBase {
  readonly kind: 'atom'
  readonly atomId: string
  readonly bondOrder: 1 | 2 | 3
}

export interface EdgeAttachmentSite extends AttachmentSiteBase {
  readonly kind: 'edge'
  readonly bondId: string
  readonly atomIds: readonly [string, string]
  readonly allowReverse: boolean
}

export type TemplateAttachmentSite = AtomAttachmentSite | EdgeAttachmentSite

export interface MolecularTemplateDraft {
  readonly schemaVersion: 1
  readonly id: string
  readonly version: number
  readonly name: string
  readonly category: TemplateDraftCategory
  readonly description: string
  readonly tags: readonly string[]
  readonly molecule: Molecule
  readonly attachmentSites: readonly TemplateAttachmentSite[]
  readonly updatedAt: string
}

export interface TemplateValidationIssue {
  readonly code: string
  readonly path: string
  readonly message: string
}

export function cloneTemplateMolecule(molecule: Molecule): Molecule {
  return {
    ...molecule,
    atoms: molecule.atoms.map(atom => ({ ...atom })),
    bonds: molecule.bonds.map(bond => ({ ...bond })),
  }
}

export function createTemplateDraft(input: {
  id: string
  name: string
  molecule: Molecule
  category?: TemplateDraftCategory
  description?: string
  tags?: readonly string[]
  attachmentSites?: readonly TemplateAttachmentSite[]
  version?: number
  updatedAt?: string
}): MolecularTemplateDraft {
  return {
    schemaVersion: 1,
    id: input.id,
    version: input.version ?? 1,
    name: input.name,
    category: input.category ?? 'molecule',
    description: input.description ?? '',
    tags: [...(input.tags ?? [])],
    molecule: cloneTemplateMolecule(input.molecule),
    attachmentSites: (input.attachmentSites ?? []).map(site => ({
      ...site,
      leavingAtomIds: [...site.leavingAtomIds],
      ...(site.kind === 'edge' ? { atomIds: [...site.atomIds] as [string, string] } : {}),
    })),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  }
}

export function createAtomAttachmentSite(input: {
  id: string
  name: string
  atomId: string
  bondOrder?: 1 | 2 | 3
  leavingAtomIds?: readonly string[]
}): AtomAttachmentSite {
  return {
    id: input.id,
    name: input.name,
    kind: 'atom',
    atomId: input.atomId,
    bondOrder: input.bondOrder ?? 1,
    leavingAtomIds: [...(input.leavingAtomIds ?? [])],
  }
}

export function createEdgeAttachmentSite(input: {
  id: string
  name: string
  bondId: string
  atomIds: readonly [string, string]
  allowReverse?: boolean
  leavingAtomIds?: readonly string[]
}): EdgeAttachmentSite {
  return {
    id: input.id,
    name: input.name,
    kind: 'edge',
    bondId: input.bondId,
    atomIds: [...input.atomIds] as [string, string],
    allowReverse: input.allowReverse ?? true,
    leavingAtomIds: [...(input.leavingAtomIds ?? [])],
  }
}

export function validateTemplateDraft(draft: MolecularTemplateDraft): TemplateValidationIssue[] {
  const issues: TemplateValidationIssue[] = []
  const atomIds = new Set<string>()
  const bondIds = new Set<string>()
  const bondPairs = new Set<string>()
  const bondsById = new Map<string, MolecularTemplateDraft['molecule']['bonds'][number]>()
  const siteIds = new Set<string>()

  if (!draft.id.trim()) issues.push({ code: 'missing-id', path: 'id', message: '模板 ID 不能为空' })
  if (!draft.name.trim()) issues.push({ code: 'missing-name', path: 'name', message: '模板名称不能为空' })
  if (draft.molecule.atoms.length === 0) {
    issues.push({ code: 'empty-molecule', path: 'molecule', message: '模板至少需要一个原子' })
  }
  draft.molecule.atoms.forEach((atom, index) => {
    const path = `molecule.atoms.${index}`
    if (!atom.id.trim()) issues.push({ code: 'missing-atom-id', path: `${path}.id`, message: '原子 ID 不能为空' })
    if (atomIds.has(atom.id)) issues.push({ code: 'duplicate-atom-id', path: `${path}.id`, message: `原子 ID 重复：${atom.id}` })
    atomIds.add(atom.id)
    if (getElementConfig(atom.symbol).atomicNumber === 0) {
      issues.push({ code: 'unknown-element', path: `${path}.symbol`, message: `未知元素：${atom.symbol}` })
    }
    if (![atom.x, atom.y, atom.z].every(Number.isFinite)) {
      issues.push({ code: 'invalid-coordinate', path, message: `原子 ${atom.id || index} 坐标必须为有限数值` })
    }
  })
  draft.molecule.bonds.forEach((bond, index) => {
    const path = `molecule.bonds.${index}`
    if (!bond.id.trim()) issues.push({ code: 'missing-bond-id', path: `${path}.id`, message: '键 ID 不能为空' })
    if (bondIds.has(bond.id)) issues.push({ code: 'duplicate-bond-id', path: `${path}.id`, message: `键 ID 重复：${bond.id}` })
    bondIds.add(bond.id)
    bondsById.set(bond.id, bond)
    if (!atomIds.has(bond.atomId1) || !atomIds.has(bond.atomId2)) {
      issues.push({ code: 'dangling-bond', path, message: `键 ${bond.id || index} 指向不存在的原子` })
    }
    if (bond.atomId1 === bond.atomId2) {
      issues.push({ code: 'self-bond', path, message: `键 ${bond.id || index} 不能连接同一原子` })
    }
    if (bond.order !== 1 && bond.order !== 2 && bond.order !== 3) {
      issues.push({ code: 'invalid-bond-order', path: `${path}.order`, message: `键级无效：${String(bond.order)}` })
    }
    const pair = [bond.atomId1, bond.atomId2].sort().join('\u0000')
    if (bondPairs.has(pair)) issues.push({ code: 'duplicate-bond', path, message: `原子 ${bond.atomId1} 与 ${bond.atomId2} 之间存在重复键` })
    bondPairs.add(pair)
  })
  if (!issues.some(issue => issue.code === 'dangling-bond' || issue.code === 'invalid-bond-order')) {
    for (const atom of draft.molecule.atoms) {
      if (valenceUsed(draft.molecule, atom.id) > maxValence(atom) + 1e-8) {
        issues.push({ code: 'excess-valence', path: `molecule.atoms.${atom.id}`, message: `${atom.symbol}(${atom.id}) 超出允许价态` })
      }
    }
  }
  draft.attachmentSites.forEach((site, index) => {
    const path = `attachmentSites.${index}`
    if (!site.id.trim()) issues.push({ code: 'missing-site-id', path: `${path}.id`, message: '连接位点 ID 不能为空' })
    if (siteIds.has(site.id)) issues.push({ code: 'duplicate-site-id', path: `${path}.id`, message: `连接位点 ID 重复：${site.id}` })
    siteIds.add(site.id)
    if (!site.name.trim()) issues.push({ code: 'missing-site-name', path: `${path}.name`, message: '连接位点名称不能为空' })

    for (const atomId of site.leavingAtomIds) {
      if (!atomIds.has(atomId)) {
        issues.push({ code: 'missing-leaving-atom', path: `${path}.leavingAtomIds`, message: `离去原子不存在：${atomId}` })
      }
    }

    if (site.kind === 'atom') {
      if (!atomIds.has(site.atomId)) {
        issues.push({ code: 'missing-anchor-atom', path: `${path}.atomId`, message: `锚点原子不存在：${site.atomId}` })
      } else if (!resolveAtomSiteAnchor(draft.molecule, site)) {
        issues.push({ code: 'orphan-hydrogen-site', path: `${path}.atomId`, message: '作为位点的 H 必须连接到一个重原子' })
      }
      return
    }

    const bond = bondsById.get(site.bondId)
    if (!bond) {
      issues.push({ code: 'missing-anchor-bond', path: `${path}.bondId`, message: `锚点边不存在：${site.bondId}` })
      return
    }
    const expected = new Set([bond.atomId1, bond.atomId2])
    if (site.atomIds.some(atomId => !expected.has(atomId))) {
      issues.push({ code: 'edge-endpoint-mismatch', path: `${path}.atomIds`, message: '边位点端点与所选键不一致' })
    }
  })

  return issues
}

function resolveAtomSiteAnchor(
  molecule: Molecule,
  site: AtomAttachmentSite,
): { anchorId: string; selectedLeavingHydrogenId?: string } | undefined {
  const selected = molecule.atoms.find(atom => atom.id === site.atomId)
  if (!selected) return undefined
  if (selected.symbol !== 'H') return { anchorId: selected.id }

  const bond = molecule.bonds.find(item => item.atomId1 === selected.id || item.atomId2 === selected.id)
  if (!bond) return undefined
  const neighborId = bond.atomId1 === selected.id ? bond.atomId2 : bond.atomId1
  const neighbor = molecule.atoms.find(atom => atom.id === neighborId)
  return neighbor && neighbor.symbol !== 'H'
    ? { anchorId: neighbor.id, selectedLeavingHydrogenId: selected.id }
    : undefined
}

function resolveAtomSiteLeavingAtomId(molecule: Molecule, site: AtomAttachmentSite): string | undefined {
  const resolved = resolveAtomSiteAnchor(molecule, site)
  if (!resolved) return undefined
  if (resolved.selectedLeavingHydrogenId) return resolved.selectedLeavingHydrogenId
  const neighborIds = molecule.bonds.flatMap(bond =>
    bond.atomId1 === resolved.anchorId ? [bond.atomId2] : bond.atomId2 === resolved.anchorId ? [bond.atomId1] : [],
  )
  const explicit = site.leavingAtomIds.find(id => neighborIds.includes(id) && molecule.atoms.some(atom => atom.id === id && atom.symbol === 'H'))
  if (explicit) return explicit
  return neighborIds.find(id => molecule.atoms.some(atom => atom.id === id && atom.symbol === 'H'))
}

function resolveAtomSiteDirection(molecule: Molecule, atomId: string): [number, number, number] {
  const anchor = molecule.atoms.find(atom => atom.id === atomId)
  if (!anchor) return [1, 0, 0]
  const neighborIds = molecule.bonds.flatMap(bond =>
    bond.atomId1 === atomId ? [bond.atomId2] : bond.atomId2 === atomId ? [bond.atomId1] : [],
  )
  const neighbors = molecule.atoms.filter(atom => neighborIds.includes(atom.id))
  if (neighbors.length === 0) return [1, 0, 0]
  const x = neighbors.reduce((sum, atom) => sum + anchor.x - atom.x, 0)
  const y = neighbors.reduce((sum, atom) => sum + anchor.y - atom.y, 0)
  const z = neighbors.reduce((sum, atom) => sum + anchor.z - atom.z, 0)
  const length = Math.hypot(x, y, z)
  return length > 1e-8 ? [x / length, y / length, z / length] : [1, 0, 0]
}

/** Compile one authored attachment site into the builder's established fragment contract. */
export function createFragmentFromTemplateSite(
  draft: MolecularTemplateDraft,
  siteId: string,
): FragmentDef {
  const site = draft.attachmentSites.find(item => item.id === siteId)
  if (!site) throw new Error(`未找到连接位点：${siteId}`)

  const indexById = new Map(draft.molecule.atoms.map((atom, index) => [atom.id, index]))
  const atoms = draft.molecule.atoms.map(atom => ({ symbol: atom.symbol, x: atom.x, y: atom.y, z: atom.z }))
  const bonds = draft.molecule.bonds.map(bond => {
    const a = indexById.get(bond.atomId1)
    const b = indexById.get(bond.atomId2)
    if (a === undefined || b === undefined) throw new Error(`模板键引用不存在的原子：${bond.id}`)
    return { a, b, order: bond.order }
  })

  if (site.kind === 'atom') {
    const resolved = resolveAtomSiteAnchor(draft.molecule, site)
    const attachIndex = resolved ? indexById.get(resolved.anchorId) : undefined
    const leavingId = resolveAtomSiteLeavingAtomId(draft.molecule, site)
    const attachHIndex = leavingId ? indexById.get(leavingId) : undefined
    if (attachIndex === undefined) throw new Error(`锚点原子不存在：${site.atomId}`)
    return {
      id: `workspace:${draft.id}:${site.id}`,
      name: `${draft.name} · ${site.name}`,
      short: draft.name.slice(0, 2),
      formula: getMolecularFormula(draft.molecule.atoms),
      atoms,
      bonds,
      attachIndex,
      attachHIndex: attachHIndex ?? -1,
      ...(attachHIndex === undefined
        ? { attachDirection: resolveAtomSiteDirection(draft.molecule, resolved?.anchorId ?? site.atomId) }
        : {}),
      attachOrder: site.bondOrder,
      group: 'group',
    }
  }

  const first = indexById.get(site.atomIds[0])
  const second = indexById.get(site.atomIds[1])
  if (first === undefined || second === undefined) throw new Error('边位点端点不存在')
  return {
    id: `workspace:${draft.id}:${site.id}`,
    name: `${draft.name} · ${site.name}`,
    short: draft.name.slice(0, 2),
    formula: getMolecularFormula(draft.molecule.atoms),
    atoms,
    bonds,
    attachIndex: first,
    attachHIndex: -1,
    attachBond: [first, second],
    group: 'ring',
  }
}
