import type { FragmentAttachmentSite } from '@retainmol/mol-viewer/fragments'

export function groupEquivalentAttachmentSites(
  sites: readonly FragmentAttachmentSite[],
): readonly FragmentAttachmentSite[] {
  const seen = new Set<string>()
  return sites.filter(site => {
    const key = `${site.equivalenceGroup}:${site.bondOrder}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export interface AttachmentSitePickerModel {
  readonly fragmentId: string
  readonly element: string
  readonly geometryId: string
  readonly name: string
  readonly pointGroup?: string
  readonly sites: readonly FragmentAttachmentSite[]
}
