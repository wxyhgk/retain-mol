import type { LucideIcon } from 'lucide-react'

export function JobSectionHeader({ icon: Icon, title, subtitle, action }: {
  icon: LucideIcon
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex min-h-14 items-center gap-3 border-b border-border px-4 py-3">
      <Icon className="size-4 text-muted-foreground" />
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </header>
  )
}
