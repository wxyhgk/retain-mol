import { useEffect, useMemo, useState } from 'react'
import {
  createTemplateDraft,
  validateTemplateDraft,
  type MolecularTemplateDraft,
  type TemplateDraftCategory,
} from '@retainmol/mol-viewer/templates'
import { activateAppWorkspaceTool } from '@/domain/workspaceToolController'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { placeMoleculeInViewer } from '@/features/molecule-placement'
import {
  listSavedTemplateDrafts,
  removeTemplateDraft,
  saveTemplateDraft,
} from '@/features/template-library'
import { parseTemplateStructureFile } from '../infrastructure/templateStructureParser'
import { slugifyTemplateId } from '../domain/templateIdentity'

export function useTemplateStudioController() {
  const objectsById = useMoleculeStore(state => state.objectsById)
  const activeObjectId = useMoleculeStore(state => state.activeObjectId)
  const molecule = activeObjectId ? objectsById[activeObjectId]?.molecule : undefined

  const [name, setName] = useState(() => molecule?.name || '未命名模板')
  const [templateId, setTemplateId] = useState(() => slugifyTemplateId(molecule?.name || 'template'))
  const [category, setCategory] = useState<TemplateDraftCategory>('molecule')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [savedDrafts, setSavedDrafts] = useState<MolecularTemplateDraft[]>(listSavedTemplateDrafts)
  const [loadedDraft, setLoadedDraft] = useState<MolecularTemplateDraft | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    activateAppWorkspaceTool('select')
    useMoleculeStore.getState().clearSelection()
  }, [])

  const currentDraft = useMemo(() => createTemplateDraft({
    id: templateId,
    name,
    category,
    description,
    tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    molecule: molecule ?? { name, atoms: [], bonds: [] },
    attachmentSites: loadedDraft?.id === templateId ? loadedDraft.attachmentSites : [],
    version: loadedDraft?.id === templateId ? loadedDraft.version : 1,
  }), [category, description, loadedDraft, molecule, name, tags, templateId])
  const issues = useMemo(() => validateTemplateDraft(currentDraft), [currentDraft])

  const save = () => {
    if (issues.length > 0) {
      setNotice(`无法保存：${issues[0].message}`)
      return
    }
    const saved = saveTemplateDraft(currentDraft)
    setLoadedDraft(saved)
    const nextDrafts = listSavedTemplateDrafts()
    setSavedDrafts(nextDrafts)
    setNotice(`“${saved.name}”已保存到本地模板库`)
  }

  const importStructure = async (file: File) => {
    try {
      const imported = parseTemplateStructureFile(await file.text(), file.name)
      const fallbackName = file.name.replace(/\.(xyz|mol|sdf)$/i, '')
      const importedName = imported.molecule.name?.trim() || fallbackName || '未命名模板'
      await placeMoleculeInViewer(imported.molecule, { mode: 'replace' })
      useMoleculeStore.getState().clearSelection()
      setName(importedName)
      setTemplateId(slugifyTemplateId(importedName))
      setLoadedDraft(null)
      setNotice(imported.moleculeCount > 1
        ? `SDF 包含 ${imported.moleculeCount} 个分子，已载入第一个`
        : `已导入 ${file.name}`)
    } catch (error) {
      setNotice(`导入失败：${error instanceof Error ? error.message : '文件格式无效'}`)
    }
  }

  const loadDraft = (draft: MolecularTemplateDraft) => {
    useMoleculeStore.getState().setMolecule(draft.molecule)
    setName(draft.name)
    setTemplateId(draft.id)
    setCategory(draft.category)
    setDescription(draft.description)
    setTags(draft.tags.join(', '))
    setLoadedDraft(draft)
    setNotice(`已载入“${draft.name}”`)
  }

  const removeDraft = (id: string) => {
    removeTemplateDraft(id)
    const nextDrafts = listSavedTemplateDrafts()
    setSavedDrafts(nextDrafts)
    setNotice('已从本地模板库移除')
  }

  return {
    molecule,
    name,
    setName,
    templateId,
    setTemplateId: (value: string) => setTemplateId(slugifyTemplateId(value)),
    category,
    setCategory,
    description,
    setDescription,
    tags,
    setTags,
    savedDrafts,
    notice,
    issues,
    save,
    importStructure,
    loadDraft,
    removeDraft,
  }
}

export type TemplateStudioController = ReturnType<typeof useTemplateStudioController>
