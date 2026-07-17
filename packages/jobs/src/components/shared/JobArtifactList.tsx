import type { LucideIcon } from 'lucide-react'
import { formatArtifactSize } from '../../domain/jobPresentation'
import type { JobArtifact } from '../../domain/jobTypes'
import { JobSectionHeader } from './JobSectionHeader'

export function JobArtifactList({ title, icon: Icon, artifacts, density = 'comfortable', renderActions }: {
  title: string
  icon: LucideIcon
  artifacts: JobArtifact[]
  density?: 'compact' | 'comfortable'
  renderActions?: (artifact: JobArtifact) => React.ReactNode
}) {
  if (density === 'compact') {
    return (
      <section>
        <h3 className="text-xs font-semibold">{title}</h3>
        <div className="mt-1.5 space-y-1.5">
          {artifacts.length === 0 && <p className="text-xs text-muted-foreground">暂无</p>}
          {artifacts.map(artifact => (
            <div key={artifact.id} className="flex items-center gap-2 border border-border bg-muted/30 px-2 py-1.5">
              <Icon className="size-3.5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{artifact.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {artifact.format}
                  {artifact.sizeBytes ? ` · ${formatArtifactSize(artifact.sizeBytes)}` : ''}
                </p>
              </div>
              {renderActions?.(artifact)}
            </div>
          ))}
        </div>
      </section>
    )
  }
  return (
    <section className="border border-border bg-card">
      <JobSectionHeader icon={Icon} title={title} subtitle={`${artifacts.length} 个文件`} />
      {artifacts.length === 0 && <p className="p-5 text-sm text-muted-foreground">暂无产物</p>}
      <div className="divide-y divide-border">
        {artifacts.map(artifact => (
          <article key={artifact.id} className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center border border-border bg-muted font-mono text-[9px] uppercase">
              {artifact.format.slice(0, 4)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{artifact.name}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {artifact.format} · {formatArtifactSize(artifact.sizeBytes)}
                {artifact.metadata?.energyHartree !== undefined ? ` · ${String(artifact.metadata.energyHartree)} Eh` : ''}
              </p>
            </div>
            {renderActions?.(artifact)}
          </article>
        ))}
      </div>
    </section>
  )
}
