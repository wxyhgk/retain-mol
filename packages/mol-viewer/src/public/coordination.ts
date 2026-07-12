import {
  createFragmentForAttachmentSite,
  getFragment,
  listFragments,
  type PublicFragmentDef,
} from './fragments'

export interface CoordinationSiteModel {
  readonly fragmentId: string
  readonly element: string
  readonly geometryId: string
  readonly name: string
  readonly pointGroup?: string
  readonly sites: NonNullable<PublicFragmentDef['coordination']>['sites']
}

export function listCoordinationFragmentsForElement(symbol: string): readonly PublicFragmentDef[] {
  return listFragments().filter(fragment =>
    fragment.group === 'coordination' &&
    fragment.atoms[fragment.attachIndex]?.symbol === symbol,
  )
}

export function getCoordinationSiteModel(fragmentId: string): CoordinationSiteModel | undefined {
  const fragment = getFragment(fragmentId)
  if (!fragment?.coordination || fragment.group !== 'coordination') return undefined
  return {
    fragmentId: fragment.id,
    element: fragment.atoms[fragment.attachIndex]?.symbol ?? '',
    geometryId: fragment.coordination.geometryId,
    name: fragment.name,
    pointGroup: fragment.coordination.pointGroup,
    sites: fragment.coordination.sites.map(site => ({
      ...site,
      direction: [...site.direction],
    })),
  }
}

export function createCoordinationFragmentForSite(
  fragmentId: string,
  siteId: string,
): PublicFragmentDef {
  const fragment = getFragment(fragmentId)
  if (!fragment?.coordination || fragment.group !== 'coordination') {
    throw new Error(`不是配位构型片段：${fragmentId}`)
  }
  return createFragmentForAttachmentSite(fragmentId, siteId)
}
