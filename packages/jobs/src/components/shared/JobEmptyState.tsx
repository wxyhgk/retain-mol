import type { LucideIcon } from 'lucide-react'
import { cn } from '@retainmol/ui-kit'

export function JobEmptyState({ icon: Icon, title, description, action, className }: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-4 py-8 text-center', className)}>
      {Icon && <Icon aria-hidden="true" className="mx-auto size-5 text-muted-foreground" />}
      <p className={cn('text-xs text-muted-foreground', Icon && 'mt-2')}>{title}</p>
      {description && <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  )
}
