import { describe, expect, it } from 'vitest'
import worker, { shouldUseSpaFallback, type SitesWorkerEnv } from './index'

function makeEnv(responses: Record<string, Response>) {
  const requests: string[] = []
  const env: SitesWorkerEnv = {
    ASSETS: {
      async fetch(request) {
        const pathname = new URL(request.url).pathname
        requests.push(pathname)
        return responses[pathname] ?? new Response('missing', { status: 404 })
      },
    },
  }
  return { env, requests }
}

describe('Sites worker', () => {
  it('returns existing static assets directly', async () => {
    const { env, requests } = makeEnv({
      '/assets/app.js': new Response('javascript', { status: 200 }),
    })
    const response = await worker.fetch(new Request('https://retainmol.test/assets/app.js'), env)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('javascript')
    expect(requests).toEqual(['/assets/app.js'])
  })

  it('falls back to index.html for client-side routes', async () => {
    const { env, requests } = makeEnv({
      '/index.html': new Response('<div id="root"></div>', {
        headers: { 'content-type': 'text/html' },
      }),
    })
    const response = await worker.fetch(new Request('https://retainmol.test/molecules/benzene'), env)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(requests).toEqual(['/molecules/benzene', '/index.html'])
  })

  it('preserves 404 responses for missing runtime resources', async () => {
    const { env, requests } = makeEnv({})
    for (const path of [
      '/assets/missing.js',
      '/openbabel/openbabel.wasm',
      '/ocl/resources.json',
      '/openbabel-worker.js',
    ]) {
      const response = await worker.fetch(new Request(`https://retainmol.test${path}`), env)
      expect(response.status).toBe(404)
    }
    expect(requests).toEqual([
      '/assets/missing.js',
      '/openbabel/openbabel.wasm',
      '/ocl/resources.json',
      '/openbabel-worker.js',
    ])
  })

  it('does not turn non-GET requests into SPA navigation', () => {
    expect(shouldUseSpaFallback(
      new Request('https://retainmol.test/molecules', { method: 'POST' }),
      new Response('missing', { status: 404 }),
    )).toBe(false)
  })
})
