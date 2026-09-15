import { useState } from 'react'
import { Eye, EyeOff, Lock, Scissors, Trash2, Unlock } from 'lucide-react'
import { InspectorLayout, InspectorSection, selectScenePanelRows } from '@/features/inspector'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { cn } from '@/lib/utils'

export function WorkspaceScenePanel() {
  const rows = useMoleculeStore(selectScenePanelRows)
  const activeObjectId = useMoleculeStore(state => state.activeObjectId)
  const setActiveObject = useMoleculeStore(state => state.setActiveObject)
  const removeSceneObject = useMoleculeStore(state => state.removeSceneObject)
  const splitSceneObject = useMoleculeStore(state => state.splitSceneObject)
  const setObjectVisible = useMoleculeStore(state => state.setObjectVisible)
  const setObjectLocked = useMoleculeStore(state => state.setObjectLocked)
  const renameObject = useMoleculeStore(state => state.renameObject)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')

  const finishRename = (id: string, fallback: string) => {
    renameObject(id, draftName.trim() || fallback)
    setEditingId(null)
  }

  return (
    <InspectorLayout>
      <InspectorSection title="场景对象">
        <p className="text-[10px] leading-4 text-muted-foreground">管理对象的活跃状态、可见性与锁定状态。</p>
      </InspectorSection>

      {rows.length === 0 ? (
        <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-border bg-background text-center text-[11px] leading-5 text-muted-foreground">
          场景中没有对象<br />从导入或搜索添加分子
        </div>
      ) : (
        <InspectorSection title={`对象 · ${rows.length}`}>
          <div className="overflow-hidden rounded-md border border-border bg-background">
            {rows.map((row, index) => {
              const active = row.id === activeObjectId
              return (
                <div
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveObject(row.id)}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setActiveObject(row.id) }}
                  className={cn(
                    'group flex min-h-12 min-w-0 items-center gap-2 px-2.5 py-2 outline-none transition-colors',
                    index > 0 && 'border-t border-border',
                    active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent',
                  )}
                >
                  <span className={cn('size-2 shrink-0 rounded-full', active ? 'bg-primary-foreground' : 'bg-muted-foreground')} />
                  {editingId === row.id ? (
                    <input
                      autoFocus
                      value={draftName}
                      onChange={event => setDraftName(event.target.value)}
                      onBlur={() => finishRename(row.id, row.name)}
                      onKeyDown={event => {
                        event.stopPropagation()
                        if (event.key === 'Enter') finishRename(row.id, row.name)
                        if (event.key === 'Escape') setEditingId(null)
                      }}
                      onClick={event => event.stopPropagation()}
                      className="h-7 min-w-0 flex-1 rounded border border-ring bg-background px-2 text-[11px] text-foreground outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onDoubleClick={event => { event.stopPropagation(); setEditingId(row.id); setDraftName(row.name) }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-[11px] font-semibold">{row.name}</span>
                      <span className="block text-[9px] text-muted-foreground">{row.componentCount > 1 ? `${row.componentCount} 个独立片段` : '单一连通结构'}</span>
                    </button>
                  )}
                  <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                    {row.componentCount > 1 && <IconButton title="分离对象" onClick={() => splitSceneObject(row.id)}><Scissors size={12} /></IconButton>}
                    <IconButton title={row.visible ? '隐藏' : '显示'} onClick={() => setObjectVisible(row.id, !row.visible)}>
                      {row.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </IconButton>
                    <IconButton title={row.locked ? '解锁' : '锁定'} active={row.locked} onClick={() => setObjectLocked(row.id, !row.locked)}>
                      {row.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </IconButton>
                    <IconButton danger title="删除" onClick={() => { if (confirm(`删除 ${row.name}？`)) removeSceneObject(row.id) }}><Trash2 size={12} /></IconButton>
                  </div>
                </div>
              )
            })}
          </div>
        </InspectorSection>
      )}
      <div className="border-t border-border pt-3 font-mono text-[9px] text-muted-foreground">{rows.length} 个对象</div>
    </InspectorLayout>
  )
}

function IconButton({ children, title, active, danger, onClick }: { children: React.ReactNode; title: string; active?: boolean; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={event => { event.stopPropagation(); onClick() }}
      className={cn(
        'flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        active && 'bg-primary text-primary-foreground',
        danger && 'hover:bg-foreground hover:text-background',
      )}
    >
      {children}
    </button>
  )
}
