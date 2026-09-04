import { Atom, Eye, Layers, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type RightRailKey = 'elements' | 'inspector' | 'scene' | 'display'

const ITEMS: Array<{ key: RightRailKey; label: string; icon: React.ElementType }> = [
  { key: 'elements', label: '元素', icon: Atom },
  { key: 'inspector', label: '属性', icon: Search },
  { key: 'scene', label: '场景', icon: Layers },
  { key: 'display', label: '显示', icon: Eye },
]

export function RightRail({ active, onPick }: { active: RightRailKey | null; onPick: (k: RightRailKey) => void }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full w-[48px] shrink-0 flex-col items-center gap-1 border-l border-border bg-card py-2">
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
              <TooltipContent side="left" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
