import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { optimizeWithGfn2Xtb, optimizeWithGfn2XtbStream } from './xtbClient'

const molecule: Molecule = {
  name: 'radical cation',
  atoms: [
    { id: 'a1', symbol: 'C', x: 0, y: 0, z: 0, charge: 1, radical: 1 },
    { id: 'a2', symbol: 'H', x: 1, y: 0, z: 0 },
  ],
  bonds: [{ id: 'b1', atomId1: 'a1', atomId2: 'a2', order: 1 }],
}

afterEach(() => vi.unstubAllGlobals())

describe('optimizeWithGfn2Xtb', () => {
  it('sends stable atom ids, charge and multiplicity and maps coordinates by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      atoms: [
        { id: 'a2', symbol: 'H', x: 1.1, y: 0.2, z: 0.3 },
        { id: 'a1', symbol: 'C', x: 0.1, y: 0.2, z: 0.3 },
      ],
      energy: -3.25,
      converged: true,
      steps: 7,
      method: 'gfn2',
    }), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await optimizeWithGfn2Xtb(molecule)
    const request = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(request).toMatchObject({ charge: 1, multiplicity: 2, method: 'gfn2' })
    expect(request.atoms.map((atom: { id: string }) => atom.id)).toEqual(['a1', 'a2'])
    expect(result.molecule.atoms[0]).toMatchObject({ id: 'a1', x: 0.1 })
    expect(result.molecule.atoms[1]).toMatchObject({ id: 'a2', x: 1.1 })
    expect(result.energy).toBe(-3.25)
  })

  it('rejects responses that cannot be mapped to the original topology', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      atoms: [
        { id: 'wrong', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'a2', symbol: 'H', x: 1, y: 0, z: 0 },
      ],
      energy: 0,
      converged: false,
      steps: 1,
      method: 'gfn2',
    }), { status: 200 })))
    await expect(optimizeWithGfn2Xtb(molecule)).rejects.toThrow('原子映射无效')
  })

  it('consumes real SSE frames and exposes per-step molecules', async () => {
    const encoder = new TextEncoder()
    const events = [
      'data: {"type":"status","message":"started"}\n\n',
      'data: {"type":"frame","step":1,"energy":-3.1,"gnorm":0.02,"atoms":[{"id":"a1","symbol":"C","x":0.2,"y":0,"z":0},{"id":"a2","symbol":"H","x":1.2,"y":0,"z":0}]}\n\n',
      'data: {"type":"done","converged":true,"steps":1,"energy":-3.2,"atoms":[{"id":"a1","symbol":"C","x":0.3,"y":0,"z":0},{"id":"a2","symbol":"H","x":1.3,"y":0,"z":0}]}\n\n',
    ]
    const body = new ReadableStream({
      start(controller) {
        for (const event of events) controller.enqueue(encoder.encode(event))
        controller.close()
      },
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    })))
    const frames: number[] = []
    const statuses: string[] = []
    const result = await optimizeWithGfn2XtbStream(molecule, {
      onStatus: message => statuses.push(message),
      onFrame: frame => frames.push(frame.molecule.atoms[0].x),
    })
    expect(statuses).toEqual(['started'])
    expect(frames).toEqual([0.2])
    expect(result).toMatchObject({ converged: true, steps: 1, energy: -3.2 })
    expect(result.molecule.atoms[0].x).toBe(0.3)
  })
})
