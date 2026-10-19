import { useEffect, useRef, useState } from 'react'
import { StructuraEditor, type EditorHandle } from 'chem-structura'
import 'chem-structura/style.css'
import { exportMol } from '@retainmol/core/io'
import { isEmbedded } from '@/app/embed'
import { parseMoleculeFile, placeMoleculeInViewer } from '@/features/molecule-placement'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { molfileSyncKey } from './molfileSyncKey'

/** 单独打开时 2D 的起始结构：苯（与原先 Ketcher 面板一致）。 */
const BENZENE = [
  '',
  '  RetainMol          2D',
  '',
  '  6  6  0  0  0  0  0  0  0  0999 V2000',
  '    1.3000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    0.6500    1.1258    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '   -0.6500    1.1258    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '   -1.3000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '   -0.6500   -1.1258    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    0.6500   -1.1258    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '  1  2  2  0  0  0  0',
  '  2  3  1  0  0  0  0',
  '  3  4  2  0  0  0  0',
  '  4  5  1  0  0  0  0',
  '  5  6  2  0  0  0  0',
  '  6  1  1  0  0  0  0',
  'M  END',
].join('\n')

/** 2D 改动停下多久后同步到 3D。 */
const SYNC_DEBOUNCE_MS = 450

/** molfile 里没有原子：空画布。 */
function isEmptyMolfile(molfile: string): boolean {
  const counts = molfile.replace(/\r\n?/g, '\n').split('\n')[3] ?? ''
  if (/V3000/.test(counts)) return /M {2}V30 COUNTS 0 /.test(molfile)
  return !/\S/.test(molfile) || Number.parseInt(counts.slice(0, 3), 10) === 0
}

type SyncState = 'idle' | 'syncing' | 'synced' | 'error'

/**
 * 2D 编辑器：chem-structura（Structura）。2D 的改动自动同步到 3D（停下 450 ms 后）；
 * 3D 推回 2D 时先交给 RDKit 排一个干净的 2D 布局（经 SMILES），不画 3D 坐标的投影。
 * 推回 2D（setMolfile/setSmiles）不触发 onChange，不会回声到 3D。
 */
export function StructuraPanel() {
  const editorRef = useRef<EditorHandle | null>(null)
  const lastMolfileRef = useRef('')
  const timerRef = useRef<number | undefined>(undefined)
  const flashRef = useRef<number | undefined>(undefined)
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const [lastError, setLastError] = useState<string | null>(null)
  // 起始结构只在挂载时读一次：3D 里已有的分子，或单独打开时的苯
  const [initialMolfile] = useState(() => {
    const active = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
    if (active.atoms.length > 0) return exportMol(active)
    return isEmbedded() ? undefined : BENZENE
  })

  const flash = (state: 'synced' | 'error', message: string | null = null) => {
    setSyncState(state)
    setLastError(message)
    window.clearTimeout(flashRef.current)
    flashRef.current = window.setTimeout(() => setSyncState('idle'), 2000)
  }

  const syncTo3D = async (molfile: string, manual = false) => {
    if (!manual && molfileSyncKey(molfile) === molfileSyncKey(lastMolfileRef.current)) return
    lastMolfileRef.current = molfile
    if (isEmptyMolfile(molfile)) {
      if (manual) flash('error', '2D 画布为空，未同步')
      return
    }
    try {
      setSyncState('syncing')
      const parsed = await parseMoleculeFile(new File([molfile], 'structura.mol', { type: 'chemical/x-mdl-molfile' }))
      const placed = await placeMoleculeInViewer(parsed.molecule, { mode: 'replace', animate2DTo3D: true })
      // 被更新的放置请求取代：不报成功，由接替者报
      if (!placed) {
        setSyncState('idle')
        return
      }
      if (manual) flash('synced')
      else setSyncState('idle')
    } catch (error) {
      console.warn('[Structura 2D→3D] sync failed', error)
      flash('error', error instanceof Error ? error.message : String(error))
    }
  }

  const onChange = (molfile: string) => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => void syncTo3D(molfile), SYNC_DEBOUNCE_MS)
  }

  /** 3D → 2D：当前 3D 分子交给 2D，经 SMILES 由 RDKit 重排成干净的 2D 布局。 */
  const pushTo2D = async () => {
    const editor = editorRef.current
    if (!editor) return
    const active = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
    if (active.atoms.length === 0) return
    try {
      setSyncState('syncing')
      editor.setMolfile(exportMol(active))
      const smiles = await editor.getSmiles().catch(() => '')
      if (smiles) await editor.setSmiles(smiles)
      editor.fit()
      // 推回后的 2D 作为基线：它不是一次需要同步回 3D 的编辑
      lastMolfileRef.current = editor.getMolfile()
      setSyncState('idle')
      setLastError(null)
    } catch (error) {
      console.warn('[Structura 3D→2D] push failed', error)
      flash('error', error instanceof Error ? error.message : String(error))
    }
  }

  useEffect(() => {
    // 嵌入模式载入分子后（app/embed.ts）：把 3D 推到 2D
    const onPush = () => void pushTo2D()
    window.addEventListener('retainmol:push-to-2d', onPush)
    // 挂载之后（编辑器 ref 就绪）：单独打开且 3D 为空时，起始的苯同步到 3D；
    // 3D 已有分子时，2D 用 RDKit 重排一次，并以它为基线
    const start = window.setTimeout(() => {
      if (initialMolfile === BENZENE) void syncTo3D(BENZENE)
      else if (initialMolfile) void pushTo2D()
    }, 0)
    return () => {
      window.clearTimeout(start)
      window.removeEventListener('retainmol:push-to-2d', onPush)
    }
    // 只在挂载时：起始结构与事件监听
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => {
    window.clearTimeout(timerRef.current)
    window.clearTimeout(flashRef.current)
  }, [])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="flex h-7 shrink-0 items-center justify-between gap-2 border-b bg-card px-2 text-[11px]">
        <span className="shrink-0 whitespace-nowrap text-muted-foreground">
          {syncState === 'syncing' ? '同步中…' : syncState === 'synced' ? '已同步到 3D ✓' : syncState === 'error' ? `同步失败：${lastError ?? ''}` : '2D ↔ 3D 自动同步'}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="whitespace-nowrap rounded border bg-background px-2 py-0.5 text-[11px] hover:bg-accent"
            onClick={() => void pushTo2D()}
          >
            推送到 2D
          </button>
          <button
            type="button"
            className="whitespace-nowrap rounded border bg-background px-2 py-0.5 text-[11px] hover:bg-accent"
            onClick={() => editorRef.current && void syncTo3D(editorRef.current.getMolfile(), true)}
          >
            同步到 3D
          </button>
        </div>
      </div>
      <div className="min-h-0 w-full flex-1">
        <StructuraEditor ref={editorRef} initialMolfile={initialMolfile} onChange={onChange} />
      </div>
    </div>
  )
}
