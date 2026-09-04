import { Atom } from 'lucide-react'
import { cn } from '@retainmol/ui-kit'
import type { JobSummary } from '../../domain/jobTypes'
import { resolveJobArtifactUrl } from '../../infrastructure/jobsApiClient'

const sizeClasses = { sm: 'size-10', lg: 'size-12' } as const

export function JobThumbnail({ job, size = 'sm', className }: {
  job: Pick<JobSummary, 'artifacts'>
  size?: keyof typeof sizeClasses
  className?: string
}) {
  const preview = job.artifacts?.find(item => item.role === 'preview' && item.format === 'png')
  const url = preview ? resolveJobArtifactUrl(preview) : null
  if (url) {
    return <img src={url} alt="" loading="lazy" className={cn(sizeClasses[size], 'shrink-0 rounded-md border border-border bg-background object-cover', className)} />
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        sizeClasses[size],
        'grid shrink-0 place-items-center rounded-md bg-gradient-to-b from-background to-muted ring-1 ring-inset ring-border',
        className,
      )}
    >
      <Atom className="size-4 text-foreground/25" />
    </span>
  )
}
