import { useId, useMemo, useState } from 'react'
import { selectInspectorTarget } from '@/domain/viewer/inspectorActions'
import { buildEntityRows, queryEntityRows, type EntityRow } from '../model/entityBrowser'
import { reportInspectorResult } from '../model/inspectorResultStore'
import { useInspectorContext } from '../model/useInspectorContext'

const buttonClass = 'rounded border border-border px-2 py-1 text-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40'

export function EntityBrowser() {
  const context = useInspectorContext()
  return <EntityBrowserContent key={context.object?.id ?? 'empty'} context={context} />
}

function EntityBrowserContent({ context }: { context: ReturnType<typeof useInspectorContext> }) {
  const { object, molecule, revision, selectedAtomIds, selectedBondIds, busyReason } = context
  const [kind, setKind] = useState<EntityRow['kind']>('atom')
  const [query, setQuery] = useState('')
  const [selectedOnly, setSelectedOnly] = useState(false)
  const [page, setPage] = useState(0)
  const helpId = useId()
  const rows = useMemo(() => buildEntityRows(molecule, kind, selectedAtomIds, selectedBondIds), [molecule, kind, selectedAtomIds, selectedBondIds])
  const result = useMemo(() => queryEntityRows(rows, query, selectedOnly, page), [rows, query, selectedOnly, page])
  const disabled = !!busyReason || !object?.visible
  const select = (row: EntityRow, focus: boolean) => {
    if (!object) return
    reportInspectorResult(selectInspectorTarget({ objectId: object.id, kind: row.kind, id: row.id, label: row.label, revision }, focus))
  }
  return (
    <section aria-label="原子与键浏览器" className="space-y-2 border-b border-border p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <label>对象类型 <select aria-label="浏览对象类型" value={kind} onChange={event => { setKind(event.target.value as EntityRow['kind']); setPage(0) }} className="rounded border border-border bg-background p-1">
          <option value="atom">原子</option><option value="bond">键</option>
        </select></label>
        <label className="ml-auto flex items-center gap-1"><input type="checkbox" checked={selectedOnly} onChange={event => { setSelectedOnly(event.target.checked); setPage(0) }} />仅已选</label>
      </div>
      <label className="block">搜索原子或键
        <input type="search" value={query} aria-describedby={helpId} onChange={event => { setQuery(event.target.value); setPage(0) }} placeholder="O、#12 或 id:完整 ID" className="mt-1 h-8 w-full rounded border border-border bg-background px-2 outline-none focus:ring-1 focus:ring-ring" />
      </label>
      <p id={helpId} className="text-[10px] text-muted-foreground">按元素、编号、标签或 id:完整 ID 搜索。选择不移动相机；聚焦会同时选择目标。</p>
      <p role="status" aria-live="polite">匹配 {result.total} 项 · 第 {result.page + 1} / {result.pageCount} 页</p>
      <ul aria-label={kind === 'atom' ? '原子搜索结果' : '键搜索结果'} className="max-h-64 space-y-1 overflow-y-auto">
        {result.rows.map(row => <li key={row.id} data-entity-id={row.id} className="flex min-w-0 gap-1">
          <button type="button" disabled={disabled} aria-pressed={row.selected} aria-label={`选择${row.kind === 'atom' ? '原子' : '键'} ${row.label}`} title={`稳定 ID: ${row.id}`} onClick={() => select(row, false)} className={`${buttonClass} min-w-0 flex-1 text-left ${row.selected ? 'bg-accent font-semibold' : ''}`}><span className="block truncate">{row.selected ? '✓ ' : ''}{row.label}</span></button>
          <button type="button" disabled={disabled} aria-label={`聚焦 ${row.label}`} onClick={() => select(row, true)} className={buttonClass}>聚焦</button>
        </li>)}
      </ul>
      {result.rows.length === 0 && <p className="py-2 text-muted-foreground">{molecule.atoms.length === 0 ? '当前分子为空' : '没有匹配结果'}</p>}
      <div className="flex justify-between gap-2">
        <button type="button" className={buttonClass} disabled={result.page === 0} onClick={() => setPage(result.page - 1)}>上一页</button>
        <button type="button" className={buttonClass} disabled={result.page + 1 >= result.pageCount} onClick={() => setPage(result.page + 1)}>下一页</button>
      </div>
      {disabled && <p className="text-muted-foreground">{busyReason ?? (!object ? '未选择分子' : '分子已隐藏')}</p>}
    </section>
  )
}
