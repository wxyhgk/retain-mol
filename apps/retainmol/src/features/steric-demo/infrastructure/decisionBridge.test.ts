import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { describe, it, expect, vi } from 'vitest'
import { createStericDecisionHandler, type StericBridgeOptions } from '../../../../build/steric-demo-plugin'
import { parseDecisionResponse, type DecisionRequest } from '../model/decisionContract'

const request: DecisionRequest = { baseRevision: 'revision-1', preference: 'spread', instruction: '尽量展开',
  topology: { formula: 'C32H22', atomCount: 54, bondCount: 59, fixedAtomCount: 40, rotatableBondId: 'b' },
  geometry: { unit: 'angstrom', policyVersion: 'ch-contact-v1' }, diagnostics: { hardClashCount: 3, crowdingScore: 5 },
  candidates: [{ id: 'torsion-15', angleDegrees: 15, hardClashCount: 0, metrics: { crowdingScore: 1, displacementRms: 2, spreadRadius: 4 } }] }
const answer = { model: 'jev-test-fixture', answers: { candidate: { choice: 'torsion-15', confidence: 0.8, probabilities: { 'torsion-15': 0.9, none: 0.1 } } } }
async function withServer(options: StericBridgeOptions, run: (url: string) => Promise<void>) {
  const handler = createStericDecisionHandler(options)
  const server = createServer((req, res) => { void handler(req, res) })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try { await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}`) }
  finally { server.closeAllConnections(); await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())) }
}
const post = (url: string, body: unknown = request, extra: Record<string, string> = {}) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(body) })

describe('Jev demo bridge (mock upstream, no live API)', () => {
  it('sends only validated candidates and returns actual model/probabilities', async () => {
    const fetcher = vi.fn(async (_url: unknown, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body))
      expect(body.state).toEqual(request)
      expect(Object.keys(body.questions.candidate.criteria)).toEqual(['torsion-15', 'none'])
      return Response.json(answer)
    }) as unknown as typeof fetch
    await withServer({ apiKey: 'test-only-placeholder', fetcher }, async url => {
      const response = await post(url)
      expect(response.status).toBe(200)
      const result = parseDecisionResponse(await response.json(), request)
      expect(result.model).toBe('jev-test-fixture')
      expect(result.choice).toBe('torsion-15')
    })
  })
  it('does not call upstream when unconfigured, cross-origin, or malformed', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch
    await withServer({ apiKey: '', fetcher }, async url => {
      expect((await post(url)).status).toBe(503)
      expect(await (await fetch(url)).json()).toMatchObject({ available: false })
    })
    await withServer({ apiKey: 'test-only-placeholder', fetcher }, async url => {
      expect((await post(url, request, { Origin: 'https://unrelated.invalid' })).status).toBe(403)
      expect((await post(url, { ...request, candidates: [{ ...request.candidates[0], hardClashCount: 1 }] })).status).toBe(422)
      expect((await post(url, { ...request, instruction: 'x'.repeat(70000) })).status).toBe(413)
    })
    expect(fetcher).not.toHaveBeenCalled()
  })
  it.each([401, 422, 429, 529])('reports upstream HTTP %i without retries or leaking its body', async status => {
    const fetcher = vi.fn(async () => new Response('private upstream diagnostic', { status })) as unknown as typeof fetch
    await withServer({ apiKey: 'test-only-placeholder', fetcher }, async url => {
      const response = await post(url)
      expect(response.status).toBe(status)
      expect(await response.text()).not.toContain('private upstream')
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('rejects a fabricated candidate or malformed probability distribution', async () => {
    await withServer({ apiKey: 'test-only-placeholder', fetcher: (async () => Response.json({ ...answer, answers: { candidate: { ...answer.answers.candidate, choice: 'invented' } } })) as typeof fetch }, async url => {
      expect((await post(url)).status).toBe(502)
    })
    expect(() => parseDecisionResponse({ baseRevision: 'revision-1', choice: 'none', confidence: 0.5, probabilities: { none: 1 }, model: 'test', elapsedMs: 1 }, request)).toThrow()
  })
  it('reports an actual abort deadline as a timeout', async () => {
    const fetcher = (async (_input: unknown, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal!.reason), { once: true })
    })) as typeof fetch
    await withServer({ apiKey: 'test-only-placeholder', fetcher, timeoutMs: 10 }, async url => {
      expect((await post(url)).status).toBe(504)
    })
  })
})
