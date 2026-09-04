import { FileInput } from 'lucide-react'
import { useMoleculeAssetQuery, useMoleculeRevisionQuery } from '@retainmol/molecule-assets'
import { revisionIdFor } from '../../domain/jobRequest'
import { formatJobDate, shortIdentifier } from '../../domain/jobPresentation'
import type { JobDetail } from '../../domain/jobTypes'
import { JobSectionHeader } from './JobSectionHeader'
import { DataCell, DetailTerm } from './JobParameterList'

export function JobInputSource({ job, variant = 'compact', action }: {
  job: JobDetail
  variant?: 'compact' | 'full'
  action?: React.ReactNode
}) {
  const revisionId = revisionIdFor(job)
  const revisionQuery = useMoleculeRevisionQuery(revisionId)
  const assetQuery = useMoleculeAssetQuery(revisionQuery.data?.assetId ?? null)
  const revision = revisionQuery.data

  if (variant === 'full') {
    return (
      <section className="border border-border bg-card">
        <JobSectionHeader icon={FileInput} title="不可变输入结构" subtitle="任务始终引用创建时的分子版本" action={action} />
        {!revisionId && <p className="p-5 text-sm text-muted-foreground">该任务创建于分子版本绑定启用之前，只保留旧版结构快照。</p>}
        {revisionId && revisionQuery.isLoading && <p className="p-5 text-sm text-muted-foreground">正在读取分子版本…</p>}
        {revisionId && revisionQuery.error && <p className="p-5 text-sm text-destructive">{revisionQuery.error.message}</p>}
        {revision && (
          <dl className="grid gap-px bg-border sm:grid-cols-2">
            <DataCell label="分子" value={assetQuery.data?.name ?? revision.assetId} />
            <DataCell label="原子数" value={String(revision.molecule.atoms.length)} />
            <DataCell label="Revision" value={revision.id} mono />
            <DataCell label="SHA-256" value={revision.contentHash} mono />
            <DataCell label="父版本" value={revision.parentRevisionId ?? '初始版本'} mono />
            <DataCell label="保存时间" value={formatJobDate(revision.createdAt)} />
          </dl>
        )}
      </section>
    )
  }

  if (!revisionId) {
    return (
      <section className="border border-border bg-muted/30 p-2 text-[11px]">
        <p className="font-medium">输入来源 · 旧版结构快照</p>
        <p className="mt-1 text-muted-foreground">该任务创建于分子版本绑定启用之前。</p>
      </section>
    )
  }
  if (revisionQuery.isLoading) {
    return <p className="text-[11px] text-muted-foreground">正在读取冻结的分子版本…</p>
  }
  if (!revision) {
    return <p className="text-[11px] text-destructive">无法读取任务绑定的分子版本 {revisionId}</p>
  }

  return (
    <section className="border border-border bg-muted/30 p-2 text-[11px]">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">输入来源 · {assetQuery.data?.name ?? revision.assetId}</p>
        <span>{revision.molecule.atoms.length} atoms</span>
      </div>
      <dl className="mt-2 grid gap-1 font-mono text-[10px] text-muted-foreground">
        <DetailTerm label="Revision" value={shortIdentifier(revision.id)} />
        <DetailTerm label="SHA-256" value={revision.contentHash.slice(0, 16)} />
      </dl>
    </section>
  )
}
