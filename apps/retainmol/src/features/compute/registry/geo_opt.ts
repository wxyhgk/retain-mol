/**
 * 计算类型：几何优化
 * 按"做什么"注册，后端（xTB / Gaussian / ORCA）是可选实现。
 */

import { registerCalcType } from './index'
import { useComputeStore } from '../store/computeStore'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@/store/moleculeStore'
import { useXtbStore } from '@/store/xtbStore'
import type { Molecule } from '@/lib/molecule'

const BACKEND_URL = 'http://localhost:8000'

async function runXtbOpt(mol: Molecule, input: Record<string, unknown>, jobId: string): Promise<void> {
  const { updateProgress, finishJob, failJob } = useComputeStore.getState()
  const { beginTransaction, endTransaction, setAtomPositions } = useMoleculeStore.getState()
  const { addFrame, resetFrames, setShowCurve } = useXtbStore.getState()

  resetFrames()
  setShowCurve(true)
  beginTransaction()

  try {
    const response = await fetch(`${BACKEND_URL}/optimize/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        atoms: mol.atoms.map(a => ({ symbol: a.symbol, x: a.x, y: a.y, z: a.z })),
        charge: (input.charge as number) ?? 0,
        multiplicity: 1,
        method: (input.method as string) ?? 'gfn2',
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
        let event: Record<string, unknown>
        try { event = JSON.parse(line.slice(6)) } catch { continue }

        if (event.type === 'frame') {
          const atoms = event.atoms as Array<{ symbol: string; x: number; y: number; z: number }> | undefined
          const snap = selectActiveMoleculeOrEmpty(useMoleculeStore.getState()).atoms
          const positions = new Map<string, { x: number; y: number; z: number }>()
          snap.forEach((a, i) => {
            if (atoms?.[i]) positions.set(a.id, { x: atoms[i].x, y: atoms[i].y, z: atoms[i].z })
          })
          setAtomPositions(positions)

          const step = (event.step as number) ?? 0
          const energy = (event.energy as number) ?? 0
          const gnorm = (event.gnorm as number) ?? 0
          updateProgress(jobId, { step, message: `步骤 ${step} | ‖g‖ = ${gnorm.toFixed(4)}` })
          addFrame({ step, energy, gnorm, atoms: atoms?.map(a => ({ ...a })) ?? [] })

        } else if (event.type === 'done') {
          finishJob(jobId, {
            energy: (event.energy as number) ?? 0,
            converged: (event.converged as boolean) ?? false,
            steps: (event.steps as number) ?? 0,
          })
        } else if (event.type === 'error') {
          throw new Error((event.message as string) ?? 'Unknown error')
        }
      }
    }
  } catch (err) {
    failJob(jobId, err instanceof Error ? err.message : String(err))
    throw err
  } finally {
    endTransaction()
  }
}

registerCalcType({
  id: 'geo_opt',
  label: '几何优化',
  category: 'structure',
  description: '优化分子几何构型，找到能量最低点',
  resultType: 'opt_curve',
  commonFields: [
    { kind: 'number', key: 'charge', label: '电荷', min: -5, max: 5, step: 1 },
  ],
  backends: [
    {
      id: 'xtb',
      label: 'xTB（半经验）',
      available: true,
      extraFields: [
        {
          kind: 'select', key: 'method', label: '方法',
          options: [
            { value: 'gfn2',  label: 'GFN2-xTB' },
            { value: 'gfn1',  label: 'GFN1-xTB' },
            { value: 'gfnff', label: 'GFN-FF' },
          ],
        },
      ],
      defaultInput: { method: 'gfn2', charge: 0 },
      run: runXtbOpt,
    },
    {
      id: 'gaussian',
      label: 'Gaussian（DFT）',
      available: false,
      extraFields: [],
      defaultInput: { charge: 0 },
      run: async () => { throw new Error('Gaussian 后端尚未实现') },
    },
  ],
})
