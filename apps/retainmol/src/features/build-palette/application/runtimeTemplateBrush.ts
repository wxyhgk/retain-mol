import type { Molecule } from '@retainmol/mol-viewer/core'
import { registerFragment, type PublicFragmentDef } from '@retainmol/mol-viewer/fragments'
import {
  createAtomAttachmentSite,
  createEdgeAttachmentSite,
  createFragmentFromTemplateSite,
  createTemplateDraft,
} from '@retainmol/mol-viewer/templates'

export type RuntimeTemplateSite =
  | { readonly kind: 'atom'; readonly atomId: string }
  | { readonly kind: 'edge'; readonly bondId: string }

export interface RuntimeTemplateBrushInput {
  readonly templateId: string
  readonly templateName: string
  readonly molecule: Molecule
  readonly site: RuntimeTemplateSite
  readonly flipped?: boolean
}

export function activateRuntimeTemplateBrush(input: RuntimeTemplateBrushInput): PublicFragmentDef {
  const siteId = 'runtime-site'
  const attachmentSite = input.site.kind === 'atom'
    ? createAtomAttachmentSite({ id: siteId, name: '当前原子', atomId: input.site.atomId })
    : createRuntimeEdgeSite(input.molecule, input.site.bondId, siteId, input.flipped ?? false)
  const draft = createTemplateDraft({
    id: `runtime-${input.templateId.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
    name: input.templateName,
    molecule: input.molecule,
    attachmentSites: [attachmentSite],
  })
  const compiled = createFragmentFromTemplateSite(draft, siteId)
  const fragment: PublicFragmentDef = {
    ...compiled,
    id: `runtime-template:${input.templateId}`,
    ...(input.site.kind === 'atom' && input.flipped && compiled.attachDirection
      ? { attachDirection: compiled.attachDirection.map(value => -value) as [number, number, number] }
      : {}),
  }
  return registerFragment(fragment)
}

function createRuntimeEdgeSite(molecule: Molecule, bondId: string, siteId: string, flipped: boolean) {
  const bond = molecule.bonds.find(candidate => candidate.id === bondId)
  if (!bond) throw new Error('选择的模板键已不存在')
  if (!isBondInCycle(molecule, bond.atomId1, bond.atomId2)) {
    throw new Error('所选模板键不在环内，不能作为并环边')
  }
  const atomIds: [string, string] = flipped
    ? [bond.atomId2, bond.atomId1]
    : [bond.atomId1, bond.atomId2]
  return createEdgeAttachmentSite({ id: siteId, name: '当前并环边', bondId, atomIds })
}

function isBondInCycle(molecule: Molecule, atomId1: string, atomId2: string): boolean {
  const adjacency = new Map<string, string[]>()
  for (const bond of molecule.bonds) {
    const isSelectedBond = (bond.atomId1 === atomId1 && bond.atomId2 === atomId2)
      || (bond.atomId1 === atomId2 && bond.atomId2 === atomId1)
    if (isSelectedBond) continue
    adjacency.set(bond.atomId1, [...(adjacency.get(bond.atomId1) ?? []), bond.atomId2])
    adjacency.set(bond.atomId2, [...(adjacency.get(bond.atomId2) ?? []), bond.atomId1])
  }

  const queue = [atomId1]
  const visited = new Set(queue)
  for (let head = 0; head < queue.length; head += 1) {
    const current = queue[head]
    if (current === atomId2) return true
    for (const next of adjacency.get(current) ?? []) {
      if (visited.has(next)) continue
      visited.add(next)
      queue.push(next)
    }
  }
  return false
}
