interface AssetFetcher {
  fetch(request: Request): Promise<Response>
}

export interface SitesWorkerEnv {
  ASSETS: AssetFetcher
}

const STATIC_PREFIXES = ['/assets/', '/openbabel/', '/ocl/']

export function shouldUseSpaFallback(request: Request, response: Response): boolean {
  if (response.status !== 404) return false
  if (request.method !== 'GET' && request.method !== 'HEAD') return false

  const { pathname } = new URL(request.url)
  if (STATIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) return false
  if (/\/[^/]+\.[^/]+$/.test(pathname)) return false
  return true
}

const worker = {
  async fetch(request: Request, env: SitesWorkerEnv): Promise<Response> {
    const assetResponse = await env.ASSETS.fetch(request)
    if (!shouldUseSpaFallback(request, assetResponse)) return assetResponse

    const fallbackUrl = new URL('/index.html', request.url)
    return env.ASSETS.fetch(new Request(fallbackUrl, request))
  },
}

export default worker
