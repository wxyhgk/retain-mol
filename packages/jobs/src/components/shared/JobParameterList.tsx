import { jobParameterRows } from '../../domain/jobPresentation'
import type { JobDetail } from '../../domain/jobTypes'

export function DetailTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  )
}

export function DataCell({ label, value, mono = false, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className={className ? `min-w-0 bg-card px-4 py-3 ${className}` : 'min-w-0 bg-card px-4 py-3'}>
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
      <dd className={mono ? 'mt-1 break-all font-mono text-[11px]' : 'mt-1 break-words text-xs font-medium'}>{value}</dd>
    </div>
  )
}

export function JobParameterList({ job, variant, layout = 'inline-dl' }: {
  job: JobDetail
  variant?: 'compact' | 'full'
  layout?: 'inline-dl' | 'cells'
}) {
  const rows = jobParameterRows(job, variant ? { variant } : {})
  if (layout === 'cells') {
    // 奇数行时最后一格跨两列,避免 dl 的 bg-border 在末尾空 cell 透出一块灰
    const oddCount = rows.length % 2 === 1
    return (
      <dl className="grid gap-px bg-border sm:grid-cols-2">
        {rows.map(([label, value], index) => (
          <DataCell
            key={label}
            label={label}
            value={value}
            className={oddCount && index === rows.length - 1 ? 'sm:col-span-2' : undefined}
          />
        ))}
      </dl>
    )
  }
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-border py-3 text-xs">
      {rows.map(([label, value]) => <DetailTerm key={label} label={label} value={value} />)}
    </dl>
  )
}
