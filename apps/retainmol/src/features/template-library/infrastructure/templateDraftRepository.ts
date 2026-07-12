import {
  createTemplateDraft,
  validateTemplateDraft,
  type MolecularTemplateDraft,
  type TemplateAttachmentSite,
  type TemplateDraftCategory,
} from '@retainmol/mol-viewer/templates'
import type { Molecule } from '@retainmol/mol-viewer/core'

const STORAGE_KEY = 'retainmol.template-drafts.v1'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

interface StorageSnapshot {
  valid: MolecularTemplateDraft[]
  invalid: unknown[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseDraft(value: unknown): MolecularTemplateDraft | null {
  if (!isRecord(value) || value.schemaVersion !== 1) return null
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return null
  if (!isRecord(value.molecule)) return null
  const molecule = value.molecule as unknown as Molecule
  if (!Array.isArray(molecule.atoms) || !Array.isArray(molecule.bonds)) return null
  if (!Array.isArray(value.tags) || !Array.isArray(value.attachmentSites)) return null

  try {
    const draft = createTemplateDraft({
      id: value.id,
      name: value.name,
      molecule,
      category: value.category as TemplateDraftCategory | undefined,
      description: typeof value.description === 'string' ? value.description : '',
      tags: value.tags.filter((tag): tag is string => typeof tag === 'string'),
      attachmentSites: value.attachmentSites as TemplateAttachmentSite[],
      version: typeof value.version === 'number' ? value.version : 1,
      updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
    })
    return validateTemplateDraft(draft).length === 0 ? draft : null
  } catch {
    return null
  }
}

function readSnapshot(): StorageSnapshot {
  if (!canUseStorage()) return { valid: [], invalid: [] }
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown
    if (!Array.isArray(raw)) return { valid: [], invalid: [raw] }
    const valid: MolecularTemplateDraft[] = []
    const invalid: unknown[] = []
    for (const item of raw) {
      const draft = parseDraft(item)
      if (draft) valid.push(draft)
      else invalid.push(item)
    }
    return { valid, invalid }
  } catch {
    return { valid: [], invalid: [] }
  }
}

function writeSnapshot(valid: readonly MolecularTemplateDraft[], invalid: readonly unknown[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...valid, ...invalid]))
}

export function listSavedTemplateDrafts(): MolecularTemplateDraft[] {
  return readSnapshot().valid.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function saveTemplateDraft(draft: MolecularTemplateDraft): MolecularTemplateDraft {
  const issues = validateTemplateDraft(draft)
  if (issues.length > 0) throw new Error(issues[0].message)
  const saved = createTemplateDraft({
    ...draft,
    version: draft.version + 1,
    updatedAt: new Date().toISOString(),
  })
  const snapshot = readSnapshot()
  const drafts = snapshot.valid.filter(item => item.id !== saved.id)
  writeSnapshot([saved, ...drafts], snapshot.invalid)
  return saved
}

export function removeTemplateDraft(id: string) {
  const snapshot = readSnapshot()
  writeSnapshot(snapshot.valid.filter(item => item.id !== id), snapshot.invalid)
}

export function getSavedTemplateDraft(id: string): MolecularTemplateDraft | undefined {
  return listSavedTemplateDrafts().find(item => item.id === id)
}
