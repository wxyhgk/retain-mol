import { useRef } from 'react'
import { useEditorStore } from '@/domain/viewer/editorState'
import { deriveWorkspaceTool, useWorkspaceToolStore } from '@/domain/workspaceToolStore'
import { useMoleculeHistory } from '@/domain/viewer/history'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { inspectorUndoReason, undoInspectorEdit } from '@/domain/viewer/inspectorActions'
import { useInspectorContext } from '../model/useInspectorContext'
import { reportInspectorResult, useInspectorResultStore } from '../model/inspectorResultStore'

export function InspectorStatus() {
  const { object, molecule, selectedAtomIds, selectedBondIds, busyReason, editReason } = useInspectorContext()
  const tool = useEditorStore(state => state.activeTool)
  const panel = useWorkspaceToolStore(state => state.activePanel)
  const toolName = { select: '选择', draw: '绘制', template: '模板', move: '移动', measure: '测量' }[deriveWorkspaceTool(panel, tool)]
  const atomCount = molecule.atoms.filter(atom => selectedAtomIds.has(atom.id)).length
  const bondCount = molecule.bonds.filter(bond => selectedBondIds.has(bond.id)).length
  return <section aria-label="当前编辑状态" aria-busy={!!busyReason} className="shrink-0 space-y-1 border-b border-border px-3 py-2 text-[11px]">
    <p className="truncate font-medium" title={object?.name}>分子：{object?.name ?? '未选择'}</p>
    <p>{molecule.atoms.length} 个原子 · {molecule.bonds.length} 条键 · 工具：{toolName}</p>
    <p>已选：{atomCount} 个原子、{bondCount} 条键 · {editReason ?? '可编辑'}</p>
  </section>
}

export function InspectorOperationResult() {
  const resultRef = useRef<HTMLElement>(null)
  const result = useInspectorResultStore(state => state.result)
  // Subscribe to scene, busy and history changes so receipt undo availability stays current.
  useInspectorContext()
  useMoleculeStore(state => state.objectsById)
  useMoleculeHistory()
  if (!result) return <div role="status" className="border-b border-border px-3 py-2 text-[11px] text-muted-foreground">最近操作：尚无定位、元素或键级操作</div>
  const reason = result.undo ? inspectorUndoReason(result.undo) : null
  return <section ref={resultRef} tabIndex={-1} aria-label="最近操作结果" className="space-y-1 border-b border-border px-3 py-2 text-[11px] focus-visible:outline-2 focus-visible:outline-ring">
    <p className="text-muted-foreground">最近定位／元素／键级操作</p>
    <div role="status" aria-live="polite" aria-atomic="true">
      <p className="font-medium">{({ success: '成功', noop: '无变化', rejected: '未完成' } as const)[result.status]} · {result.action}</p>
      <p className="break-words">目标：{result.target.label}</p>
      <p>{result.message}</p>
    </div>
    <details className="text-muted-foreground"><summary className="cursor-pointer">目标标识</summary><p className="break-all">分子 ID：{result.target.objectId}<br />{result.target.kind === 'atom' ? '原子' : '键'} ID：{result.target.id}{result.code && <><br />原因代码：{result.code}</>}</p></details>
    {result.undo && <>
      <button type="button" disabled={!!reason} title={reason ?? '只撤销这次编辑'} onClick={() => {
        if (result.undo) reportInspectorResult(undoInspectorEdit(result.undo))
        resultRef.current?.focus()
      }} className="rounded border border-border px-2 py-1 hover:bg-accent disabled:opacity-40">撤销本次编辑</button>
      {reason && <p className="text-muted-foreground">{reason}</p>}
    </>}
  </section>
}
