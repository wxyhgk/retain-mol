import type { Molecule } from '@retainmol/mol-viewer/core'

// HTTP/SSE transport only. Store writes and task state belong to the application layer.

const XTB_API_BASE = (import.meta.env.VITE_RETAINMOL_BACKEND_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')
const XTB_TIMEOUT_MS = 5 * 60_000

interface XtbAtomResult {
  id: string
  symbol: string
  x: number
  y: number
  z: number
}

interface XtbFrameEvent {
  type: 'frame'
  step: number
  energy: number
  gnorm: number
  atoms: XtbAtomResult[]
}

interface XtbDoneEvent {
  type: 'done'
  converged: boolean
  steps: number
  energy: number
  atoms: XtbAtomResult[] | null
  warning?: string | null
}

type XtbStreamEvent =
  | { type: 'status'; message: string }
  | { type: 'error'; message: string }
  | XtbFrameEvent
  | XtbDoneEvent

interface XtbOptimizeResponse {
  atoms: XtbAtomResult[]
  energy: number
  converged: boolean
  steps: number
  method: string
}

export interface XtbOptimizeResult {
  molecule: Molecule
  energy: number
  converged: boolean
  steps: number
}

export interface XtbOptimizationFrame {
  molecule: Molecule
  step: number
  energy: number
  gnorm: number
}

function chargeAndMultiplicity(molecule: Molecule) {
  const charge = molecule.atoms.reduce((sum, atom) => sum + (atom.charge ?? 0), 0)
  const unpairedElectrons = molecule.atoms.reduce((sum, atom) => sum + Math.abs(atom.radical ?? 0), 0)
  return { charge, multiplicity: Math.max(1, unpairedElectrons + 1) }
}

function validateResponse(molecule: Molecule, response: XtbOptimizeResponse) {
  if (!Array.isArray(response.atoms) || response.atoms.length !== molecule.atoms.length) {
    throw new Error('xTB 返回的原子数与当前分子不一致')
  }
  const expected = new Map(molecule.atoms.map(atom => [atom.id, atom.symbol]))
  for (const atom of response.atoms) {
    if (expected.get(atom.id) !== atom.symbol) throw new Error(`xTB 原子映射无效：${atom.id}`)
    if (![atom.x, atom.y, atom.z].every(Number.isFinite)) throw new Error(`xTB 返回了无效坐标：${atom.id}`)
  }
}

function validateAtoms(molecule: Molecule, atoms: XtbAtomResult[]) {
  validateResponse(molecule, {
    atoms,
    energy: 0,
    converged: false,
    steps: 0,
    method: 'gfn2',
  })
}

function moleculeWithCoordinates(molecule: Molecule, atoms: XtbAtomResult[]): Molecule {
  validateAtoms(molecule, atoms)
  const positions = new Map(atoms.map(atom => [atom.id, atom]))
  return {
    ...molecule,
    atoms: molecule.atoms.map(atom => {
      const position = positions.get(atom.id)!
      return { ...atom, x: position.x, y: position.y, z: position.z }
    }),
  }
}

function requestBody(molecule: Molecule) {
  const { charge, multiplicity } = chargeAndMultiplicity(molecule)
  return JSON.stringify({
    atoms: molecule.atoms.map(atom => ({
      id: atom.id,
      symbol: atom.symbol,
      x: atom.x,
      y: atom.y,
      z: atom.z,
    })),
    charge,
    multiplicity,
    method: 'gfn2',
    max_steps: 300,
    optlevel: 'normal',
  })
}

async function responseError(response: Response) {
  let detail = `HTTP ${response.status}`
  try {
    const body = await response.json() as { detail?: string }
    if (body.detail) detail = body.detail
  } catch { /* response body is not JSON */ }
  return `GFN2-xTB 优化失败：${detail}`
}

export async function optimizeWithGfn2Xtb(
  molecule: Molecule,
  options: { signal?: AbortSignal } = {},
): Promise<XtbOptimizeResult> {
  if (molecule.atoms.length < 2) throw new Error('至少需要两个原子才能运行 xTB 优化')
  const timeout = AbortSignal.timeout(XTB_TIMEOUT_MS)
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout
  const response = await fetch(`${XTB_API_BASE}/optimize`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal,
    body: requestBody(molecule),
  })
  if (!response.ok) {
    throw new Error(await responseError(response))
  }
  const result = await response.json() as XtbOptimizeResponse
  return {
    molecule: moleculeWithCoordinates(molecule, result.atoms),
    energy: result.energy,
    converged: result.converged,
    steps: result.steps,
  }
}

export async function optimizeWithGfn2XtbStream(
  molecule: Molecule,
  options: {
    signal?: AbortSignal
    onStatus?: (message: string) => void
    onFrame?: (frame: XtbOptimizationFrame) => void
  } = {},
): Promise<XtbOptimizeResult> {
  if (molecule.atoms.length < 2) throw new Error('至少需要两个原子才能运行 xTB 优化')
  const timeout = AbortSignal.timeout(XTB_TIMEOUT_MS)
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout
  const response = await fetch(`${XTB_API_BASE}/optimize/stream`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
    signal,
    body: requestBody(molecule),
  })
  if (!response.ok) throw new Error(await responseError(response))
  if (!response.body) throw new Error('浏览器不支持读取 xTB 优化流')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let doneEvent: XtbDoneEvent | null = null
  let lastMolecule = molecule

  const consumeEvent = (block: string) => {
    const payload = block.split('\n')
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trimStart())
      .join('\n')
    if (!payload) return
    const event = JSON.parse(payload) as XtbStreamEvent
    if (event.type === 'error') throw new Error(`GFN2-xTB 优化失败：${event.message}`)
    if (event.type === 'status') {
      options.onStatus?.(event.message)
      return
    }
    if (event.type === 'frame') {
      lastMolecule = moleculeWithCoordinates(molecule, event.atoms)
      options.onFrame?.({
        molecule: lastMolecule,
        step: event.step,
        energy: event.energy,
        gnorm: event.gnorm,
      })
      return
    }
    doneEvent = event
    if (event.atoms) lastMolecule = moleculeWithCoordinates(molecule, event.atoms)
  }

  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n')
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''
    for (const block of blocks) consumeEvent(block)
    if (done) break
  }
  if (buffer.trim()) consumeEvent(buffer)
  if (!doneEvent) throw new Error('xTB 优化流在返回完成事件前中断')
  return {
    molecule: lastMolecule,
    energy: doneEvent.energy,
    converged: doneEvent.converged,
    steps: doneEvent.steps,
  }
}
