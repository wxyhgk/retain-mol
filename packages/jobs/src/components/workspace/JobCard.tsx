import { cn } from '@retainmol/ui-kit'
import { calculationLabel, formatJobDate } from '../../domain/jobPresentation'
import type { JobSummary } from '../../domain/jobTypes'
import { JobStatusBadge } from '../JobStatusBadge'
import { JobThumbnail } from '../shared/JobThumbnail'

export function JobCard({ job, selected, onSelect }: { job: JobSummary; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={cn('w-full border p-2 text-left', selected ? 'border-foreground bg-background' : 'border-transparent hover:border-border hover:bg-background')}>
      <div className="flex items-center gap-2">
        <JobThumbnail job={job} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{job.name || calculationLabel(job.kind)}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{formatJobDate(job.createdAt)}</p>
        </div>
        <JobStatusBadge status={job.status} size="sm" />
      </div>
    </button>
  )
}
