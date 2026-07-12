import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTemplateDraft } from '@retainmol/mol-viewer/templates'
import { newAtom } from '@retainmol/mol-viewer/core'
import {
  listSavedTemplateDrafts,
  saveTemplateDraft,
} from './templateDraftRepository'

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

afterEach(() => vi.unstubAllGlobals())

describe('templateDraftRepository', () => {
  it('isolates invalid records and preserves them when saving a valid draft', () => {
    const localStorage = new MemoryStorage()
    localStorage.setItem('retainmol.template-drafts.v1', JSON.stringify([
      { schemaVersion: 1, id: 'broken', name: 'Broken' },
    ]))
    vi.stubGlobal('window', { localStorage })
    const draft = createTemplateDraft({
      id: 'valid',
      name: 'Valid',
      molecule: { atoms: [newAtom('C')], bonds: [] },
    })

    expect(listSavedTemplateDrafts()).toEqual([])
    saveTemplateDraft(draft)
    expect(listSavedTemplateDrafts().map(item => item.id)).toEqual(['valid'])
    expect(JSON.parse(localStorage.getItem('retainmol.template-drafts.v1')!)).toHaveLength(2)
  })
})
