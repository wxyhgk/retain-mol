import { useCallback, useMemo, useState } from 'react'
import { getElementConfig } from '@retainmol/mol-viewer/core'
import {
  getFragment,
  getFragmentAttachmentSites,
} from '@retainmol/mol-viewer/fragments'
import { getBuildFragmentsForElement } from '../domain/buildCatalog'
import {
  groupEquivalentAttachmentSites,
  type AttachmentSitePickerModel,
} from '../domain/attachmentSiteOptions'

interface Options {
  readonly inspectedElement: string
  readonly onBeginAttachmentSitePick: () => void
  readonly onPickAttachmentSite: (fragmentId: string, siteId: string) => boolean
  readonly onPickFragment: (fragmentId: string) => void
}

export function useDrawWorkspacePanelModel({
  inspectedElement,
  onBeginAttachmentSitePick,
  onPickAttachmentSite,
  onPickFragment,
}: Options) {
  const [attachmentFragmentId, setAttachmentFragmentId] = useState<string | null>(null)
  const [selectedAttachmentSiteId, setSelectedAttachmentSiteId] = useState<string | null>(null)
  const element = useMemo(() => getElementConfig(inspectedElement), [inspectedElement])
  const fragments = useMemo(() => getBuildFragmentsForElement(inspectedElement), [inspectedElement])

  const attachment = useMemo(() => {
    if (!attachmentFragmentId) return null
    const fragment = getFragment(attachmentFragmentId)
    if (!fragment) return null
    const sites = getFragmentAttachmentSites(attachmentFragmentId)
    const model: AttachmentSitePickerModel = {
      fragmentId: fragment.id,
      element: fragment.atoms[fragment.attachIndex]?.symbol ?? '',
      geometryId: fragment.coordination?.geometryId ?? fragment.group ?? 'fragment',
      name: fragment.name,
      pointGroup: fragment.coordination?.pointGroup,
      sites,
    }
    return {
      model,
      siteOptions: groupEquivalentAttachmentSites(sites),
    }
  }, [attachmentFragmentId])

  const chooseFragment = useCallback((fragmentId: string) => {
    const siteOptions = groupEquivalentAttachmentSites(getFragmentAttachmentSites(fragmentId))
    if (siteOptions.length <= 1) {
      onPickFragment(fragmentId)
      return
    }
    onBeginAttachmentSitePick()
    setAttachmentFragmentId(fragmentId)
    setSelectedAttachmentSiteId(null)
  }, [onBeginAttachmentSitePick, onPickFragment])

  const chooseAttachmentSite = useCallback((siteId: string) => {
    if (!attachment) return false
    const accepted = onPickAttachmentSite(attachment.model.fragmentId, siteId)
    if (accepted) setSelectedAttachmentSiteId(siteId)
    return accepted
  }, [attachment, onPickAttachmentSite])

  const closeAttachmentPicker = useCallback(() => {
    setAttachmentFragmentId(null)
    setSelectedAttachmentSiteId(null)
  }, [])

  return {
    element,
    fragments,
    attachment,
    selectedAttachmentSiteId,
    chooseFragment,
    chooseAttachmentSite,
    closeAttachmentPicker,
  }
}
