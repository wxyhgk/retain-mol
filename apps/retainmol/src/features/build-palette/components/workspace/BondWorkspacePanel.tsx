import { Link2, MousePointer2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WorkspaceSection } from './WorkspacePanelUi'

type BondOrder = 1 | 2 | 3

export interface BondWorkspacePanelProps {
  selectedAtomCount: number
  selectedBond: { readonly id: string; readonly order: BondOrder; readonly atomSymbols: readonly string[] } | null
  onConnectSelectedAtoms: () => void
  onSetBondOrder: (order: BondOrder) => void
  onDeleteSelectedBond: () => void
}

export function BondWorkspacePanel(props: BondWorkspacePanelProps) {
  const canConnect = props.selectedAtomCount === 2
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-muted px-3 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
          <MousePointer2 size={13} />先选择两个原子
        </div>
        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">选择模式支持 Shift 多选。按 D 返回 Draw 后即可建立一根新键。</p>
      </div>

      <WorkspaceSection title="连接原子" meta={`${props.selectedAtomCount} / 2`}>
        <button
          type="button"
          disabled={!canConnect}
          onClick={props.onConnectSelectedAtoms}
          className={cn(
            'flex h-11 w-full items-center justify-center gap-2 rounded-md border text-xs font-semibold transition-colors',
            canConnect
              ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
              : 'cursor-not-allowed border-border bg-muted text-muted-foreground',
          )}
        >
          <Link2 size={15} />
          连接两个已选原子
        </button>
      </WorkspaceSection>

      <WorkspaceSection title="选中键" meta={props.selectedBond ? props.selectedBond.atomSymbols.join(' – ') : '未选择'}>
        {props.selectedBond ? (
          <div className="space-y-2.5 rounded-md border border-border bg-muted p-2.5">
            <div role="group" aria-label="键级" className="grid grid-cols-3 gap-1.5">
              {([1, 2, 3] as const).map(order => (
                <button
                  key={order}
                  type="button"
                  aria-label={`设为${order === 1 ? '单' : order === 2 ? '双' : '三'}键`}
                  aria-pressed={props.selectedBond?.order === order}
                  onClick={() => props.onSetBondOrder(order)}
                  className={cn(
                    'h-10 rounded-md border text-[11px] font-semibold transition-colors',
                    props.selectedBond?.order === order
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground',
                  )}
                >
                  {order === 1 ? '单键' : order === 2 ? '双键' : '三键'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={props.onDeleteSelectedBond}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-foreground bg-card text-[11px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <Trash2 size={13} />删除选中键
            </button>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-muted text-[11px] text-muted-foreground">
            在画布中点击一根键
          </div>
        )}
      </WorkspaceSection>
    </div>
  )
}
