import { Atom, Eraser, Hexagon, Move3d, Pencil, Ruler, MousePointer2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type LeftRailKey = 'select' | 'draw' | 'ketcher' | 'template' | 'move' | 'measure' | 'erase'

const ITEMS: Array<{ key: LeftRailKey; label: string; icon: React.ElementType; kbd: string }> = [
  { key: 'select', label: '选择', icon: MousePointer2, kbd: 'S' },
  { key: 'draw', label: '绘制', icon: Atom, kbd: 'D' },
  { key: 'ketcher', label: '2D 草图（切图层）', icon: Pencil, kbd: '2D' },
  { key: 'template', label: '模板', icon: Hexagon, kbd: 'T' },
  { key: 'move', label: '移动', icon: Move3d, kbd: 'Mv' },
  { key: 'measure', label: '测量', icon: Ruler, kbd: 'Ms' },
  { key: 'erase', label: '擦除', icon: Eraser, kbd: 'Del' },
]

export function LeftRail({ active, onPick }: { active: LeftRailKey | null; onPick: (k: LeftRailKey) => void }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full w-[56px] shrink-0 flex-col items-center gap-1 border-r border-border bg-card py-2">
        {ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={item.label}
                  aria-pressed={isActive}
                  onClick={() => onPick(item.key)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-md border text-muted-foreground transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-primary text-primary-foreground border-primary shadow-sm',
                    !isActive && 'border-transparent bg-transparent',
                  )}
                >
                  <Icon size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.label} · {item.kbd}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
