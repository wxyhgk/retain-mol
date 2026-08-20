import {
  createFragmentForAttachmentSite,
  getFragment,
  registerFragment,
} from '@retainmol/mol-viewer/fragments'
import type { WorkspaceToolEffects } from '@/domain/workspaceToolStore'
import { listSavedTemplateDrafts } from '@/features/template-library'
import { placeMoleculeInViewer } from '@/features/molecule-placement'
import {
  selectFragmentBuildMode,
  selectTemplateFragmentBuildMode,
} from './buildModeCommands'
import { activateRuntimeTemplateBrush, type RuntimeTemplateSite } from './runtimeTemplateBrush'
import { createCanvasMoleculeFromTemplate, type CanvasTemplateSummary } from '../domain/buildCatalog'

interface Options {
  readonly effects: WorkspaceToolEffects
  readonly flashHint: (message: string) => void
}

/** Fragment/template actions shared by the draw and template workspace panels. */
export function createBuildPaletteFragmentActions({ effects, flashHint }: Options) {
  const pickDrawFragment = (id: string) => {
    const fragment = getFragment(id)
    selectFragmentBuildMode(id, fragment?.atoms[fragment.attachIndex]?.symbol, effects)
  }

  const pickAttachmentSite = (fragmentId: string, siteId: string) => {
    try {
      const fragment = registerFragment(createFragmentForAttachmentSite(fragmentId, siteId))
      selectFragmentBuildMode(
        fragment.id,
        fragment.atoms[fragment.attachIndex]?.symbol,
        effects,
      )
      return true
    } catch (error) {
      flashHint(error instanceof Error ? error.message : '无法使用所选配位位点')
      return false
    }
  }

  const pickTemplateFragment = (id: string) => {
    const fragment = getFragment(id)
    selectTemplateFragmentBuildMode(id, fragment?.atoms[fragment.attachIndex]?.symbol, effects)
  }

  const pickTemplate = (id: string) => {
    const molecule = createCanvasMoleculeFromTemplate(id, listSavedTemplateDrafts())
    if (molecule) void placeMoleculeInViewer(molecule, { mode: 'replace' })
  }

  const pickRuntimeTemplateSite = (
    template: CanvasTemplateSummary,
    site: RuntimeTemplateSite,
    flipped: boolean,
  ) => {
    if (!template.molecule) return false
    try {
      const fragment = activateRuntimeTemplateBrush({
        templateId: template.id,
        templateName: template.name,
        molecule: template.molecule,
        site,
        flipped,
      })
      selectTemplateFragmentBuildMode(
        fragment.id,
        fragment.atoms[fragment.attachIndex]?.symbol,
        effects,
      )
      return true
    } catch (error) {
      flashHint(error instanceof Error ? error.message : '无法使用所选模板位点')
      return false
    }
  }

  return {
    pickDrawFragment,
    pickAttachmentSite,
    pickTemplateFragment,
    pickTemplate,
    pickRuntimeTemplateSite,
  }
}
