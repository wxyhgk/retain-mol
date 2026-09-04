import type {
  CreateMoleculeAssetRequest,
  CreateMoleculeRevisionRequest,
  MoleculeAssetsApi,
  MoleculeAssetsRequestOptions,
} from '../application/moleculeAssetsApi'
import {
  projectMoleculeAssetListWire,
  projectMoleculeAssetWire,
  projectMoleculeRevisionListWire,
  projectMoleculeRevisionWire,
} from './moleculeAssetWireProjector'
import type { MoleculeAsset } from '../domain/types'

interface BrowserLocation {
  readonly protocol: string
  readonly hostname: string
}

let configuredApiBaseUrl: string | undefined

/**
 * 由宿主 app 在启动时注入后端地址。包内不读 import.meta.env —— vite 只在
 * 应用构建时替换 env,依赖包里的 env 表达式不会按预期求值。
 */
export function configureMoleculeAssetsApiBase(url: string | undefined) {
  configuredApiBaseUrl = url?.trim() ? url.trim() : undefined
}

export function resolveMoleculeAssetsApiBase(
  configuredUrl: string | undefined = configuredApiBaseUrl,
  browserLocation: BrowserLocation | undefined = typeof window === 'undefined' ? undefined : window.location,
): string {
  const configured = configuredUrl?.trim()
  if (configured) return configured.replace(/\/$/, '')
  if (browserLocation?.hostname) return `${browserLocation.protocol}//${browserLocation.hostname}:8000`
  return 'http://127.0.0.1:8000'
}

export class MoleculeAssetsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Readonly<Record<string, string>> = {},
    readonly code: string | null = null,
    readonly currentAsset: MoleculeAsset | null = null,
  ) {
    super(message)
    this.name = 'MoleculeAssetsApiError'
  }
}

export class MoleculeAssetsApiClient implements MoleculeAssetsApi {
  constructor(private readonly baseUrlOverride?: string) {}

  private get baseUrl() {
    return resolveMoleculeAssetsApiBase(this.baseUrlOverride)
  }

  listAssets(options: MoleculeAssetsRequestOptions = {}) {
    return this.request('/molecule-assets', options).then(projectMoleculeAssetListWire)
  }

  createAsset(request: CreateMoleculeAssetRequest, options: MoleculeAssetsRequestOptions = {}) {
    return this.request('/molecule-assets', { method: 'POST', body: request, ...options })
      .then(projectMoleculeAssetWire)
  }

  getAsset(assetId: string, options: MoleculeAssetsRequestOptions = {}) {
    return this.request(`/molecule-assets/${encodeURIComponent(assetId)}`, options)
      .then(projectMoleculeAssetWire)
  }

  getRevision(revisionId: string, options: MoleculeAssetsRequestOptions = {}) {
    return this.request(`/molecule-revisions/${encodeURIComponent(revisionId)}`, options)
      .then(projectMoleculeRevisionWire)
  }

  listRevisions(assetId: string, options: MoleculeAssetsRequestOptions = {}) {
    return this.request(
      `/molecule-assets/${encodeURIComponent(assetId)}/revisions`,
      options,
    ).then(projectMoleculeRevisionListWire)
  }

  createRevision(
    assetId: string,
    request: CreateMoleculeRevisionRequest,
    options: MoleculeAssetsRequestOptions = {},
  ) {
    return this.request(`/molecule-assets/${encodeURIComponent(assetId)}/revisions`, {
      method: 'POST',
      body: request,
      ...options,
    }).then(projectMoleculeRevisionWire)
  }

  private async request(
    path: string,
    options: MoleculeAssetsRequestOptions & { method?: 'POST'; body?: unknown },
  ): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers: options.body === undefined ? undefined : { 'content-type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
    if (!response.ok) throw await responseError(response)
    return response.json() as Promise<unknown>
  }
}

async function responseError(response: Response): Promise<MoleculeAssetsApiError> {
  let detail = `HTTP ${response.status}`
  const fieldErrors: Record<string, string> = {}
  let code: string | null = null
  let currentAsset: MoleculeAsset | null = null
  try {
    const payload = await response.json() as {
      readonly detail?: string
        | ReadonlyArray<{ readonly loc?: ReadonlyArray<string | number>; readonly msg?: string }>
        | { readonly code?: string; readonly message?: string; readonly currentAsset?: unknown }
      readonly message?: string
    }
    if (Array.isArray(payload.detail)) {
      for (const issue of payload.detail) {
        const field = issue.loc?.filter(part => part !== 'body').join('.')
        if (field && issue.msg) fieldErrors[field] = issue.msg
      }
      detail = payload.detail.map(issue => issue.msg).filter(Boolean).join('; ') || detail
    } else if (typeof payload.detail === 'string') {
      detail = payload.detail
    } else if (payload.detail && typeof payload.detail === 'object') {
      const conflictDetail = payload.detail as {
        readonly code?: unknown
        readonly message?: unknown
        readonly currentAsset?: unknown
      }
      code = typeof conflictDetail.code === 'string' ? conflictDetail.code : null
      detail = typeof conflictDetail.message === 'string' ? conflictDetail.message : detail
      if (conflictDetail.currentAsset !== undefined) {
        try {
          currentAsset = projectMoleculeAssetWire(conflictDetail.currentAsset, 'conflict.currentAsset')
        } catch {
          currentAsset = null
        }
      }
    } else if (payload.message) {
      detail = payload.message
    }
  } catch {
    // The status remains actionable when an upstream proxy emits a non-JSON body.
  }
  return new MoleculeAssetsApiError(
    `Molecule assets API request failed: ${detail}`,
    response.status,
    fieldErrors,
    code,
    currentAsset,
  )
}
