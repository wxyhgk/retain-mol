import { Box, FlaskConical, Pencil, Search, Split, Undo2, Redo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMoleculeHistory } from '@/domain/viewer/history'
import type { ViewMode } from './ShellFrame'

export function TopBar({ view, onViewChange, onSearch }: { view: ViewMode; onViewChange: (m: ViewMode) => void; onSearch?: () => void }) {
  const { undo, redo, canUndo, canRedo } = useMoleculeHistory()

  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground"><FlaskConical size={14} /></span>
          RetainMol
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Demo: Editor Shell</span>
        </div>
        <span className="mx-2 h-5 w-px bg-border hidden sm:block" aria-hidden />
        <div className="flex items-center rounded-full bg-muted p-1">
          <button
            type="button"
            aria-pressed={view === '2d'}
            onClick={() => onViewChange('2d')}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${view === '2d' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Pencil size={13} /> 2D
          </button>
          <button
            type="button"
            aria-pressed={view === 'split'}
            onClick={() => onViewChange('split')}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${view === 'split' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Split size={13} /> 并存
          </button>
          <button
            type="button"
            aria-pressed={view === '3d'}
            onClick={() => onViewChange('3d')}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${view === '3d' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Box size={13} /> 3D
          </button>
        </div>
        <span className="hidden text-[11px] text-muted-foreground sm:inline">2D · 并存 · 3D</span>
        <span className="mx-1 h-5 w-px bg-border hidden sm:block" aria-hidden />
        <div className="hidden sm:flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canUndo} onClick={() => undo()} aria-label="撤销"><Undo2 size={14} /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canRedo} onClick={() => redo()} aria-label="重做"><Redo2 size={14} /></Button>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onSearch}><Search size={14} /> 搜索分子</Button>
      </div>
    </div>
  )
}
