import { useState, useCallback } from 'react'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@/store/moleculeStore'
import { useXtbStore } from '@/store/xtbStore'

const BACKEND_URL = 'http://localhost:8000'

export type XtbMethod = 'gfn2' | 'gfn1' | 'gfnff'

export interface XtbOptimizeResult {
  energy: number
  converged: boolean
  steps: number
}

export function useXtbOptimize() {
  const [running, setRunning] = useState(false)
  const [lastResult, setLastResult] = useState<XtbOptimizeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [gnorm, setGnorm] = useState<number | null>(null)

  const optimize = useCallback(async (method: XtbMethod = 'gfn2') => {
    const { setAtomPositions, beginTransaction, endTransaction } = useMoleculeStore.getState()
    const molecule = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
    const { addFrame, resetFrames, setShowCurve } = useXtbStore.getState()

    if (molecule.atoms.length < 2) {
      setError('至少需要 2 个原子')
      return
    }

    setRunning(true)
    setError(null)
    setCurrentStep(0)
    setGnorm(null)
    setLastResult(null)
    resetFrames()
    setShowCurve(true)

    beginTransaction()

    try {
      const response = await fetch(`${BACKEND_URL}/optimize/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atoms: molecule.atoms.map(a => ({ symbol: a.symbol, x: a.x, y: a.y, z: a.z })),
          charge: 0,
          multiplicity: 1,
          method,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({ detail: response.statusText }))
        throw new Error((body as { detail?: string }).detail ?? response.statusText)
      }

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          let event: {
            type: string
            step?: number
            energy?: number
            gnorm?: number
            atoms?: Array<{ symbol: string; x: number; y: number; z: number }>
            converged?: boolean
            steps?: number
            message?: string
          }

          try {
            event = JSON.parse(line.slice(6))
          } catch {
            continue
          }

          if (event.type === 'frame') {
            const atomsSnapshot = selectActiveMoleculeOrEmpty(useMoleculeStore.getState()).atoms
            const positions = new Map<string, { x: number; y: number; z: number }>()
            atomsSnapshot.forEach((a, i) => {
              if (event.atoms?.[i]) {
                positions.set(a.id, { x: event.atoms[i].x, y: event.atoms[i].y, z: event.atoms[i].z })
              }
            })
            useMoleculeStore.getState().setAtomPositions(positions)
            const step = event.step ?? 0
            const energy = event.energy ?? 0
            const g = event.gnorm ?? 0
            setCurrentStep(step)
            setGnorm(g)
            addFrame({
              step, energy, gnorm: g,
              atoms: event.atoms?.map(a => ({ symbol: a.symbol, x: a.x, y: a.y, z: a.z })) ?? [],
            })
          } else if (event.type === 'done') {
            setLastResult({
              energy: event.energy ?? 0,
              converged: event.converged ?? false,
              steps: event.steps ?? 0,
            })
          } else if (event.type === 'error') {
            setError(event.message ?? 'Unknown error')
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      endTransaction()
      setRunning(false)
    }
  }, [])

  return { optimize, running, currentStep, gnorm, lastResult, error }
}
