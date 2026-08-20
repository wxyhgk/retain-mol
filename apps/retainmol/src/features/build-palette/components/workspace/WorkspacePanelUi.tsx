import type { ReactNode } from 'react'

export function WorkspaceSection({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div className="flex min-w-0 items-center gap-2">
      <h3 className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
        {meta && <span className="ml-auto shrink-0 font-mono text-[9px] text-muted-foreground">{meta}</span>}
      </div>
      {children}
    </section>
  )
}
