import { Atom } from 'lucide-react'
import { Chip, ElapsedTime, MonoId } from '@retainmol/ui-kit'
import { Molecule2D, MoleculeCard, type MoleculeCardVariant } from '@retainmol/molecule-assets'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { calculationLabel } from '../../domain/jobPresentation'
import type { JobSummary } from '../../domain/jobTypes'
import { isTerminalJobStatus } from '../../application/jobQueries'
import { resolveJobArtifactUrl } from '../../infrastructure/jobsApiClient'
import { JobStatusBadge } from '../JobStatusBadge'

function JobVisual({ job, molecule }: { job: JobSummary; molecule?: Molecule }) {
  const preview = job.artifacts?.find(item => item.role === 'preview' && item.format === 'png')
  const url = preview ? resolveJobArtifactUrl(preview) : null
  if (url) return <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
  if (molecule) return <Molecule2D molecule={molecule} className="h-full w-full text-foreground" />
  return (
    <span aria-hidden="true" className="grid h-full w-full place-items-center bg-muted">
      <Atom className="size-4 text-muted-foreground" />
    </span>
  )
}

export interface JobCardProps {
  job: JobSummary
  variant?: MoleculeCardVariant
  /** 有分子图时作为 2D 兜底视觉（无 preview 截图时启用） */
  molecule?: Molecule
  selected?: boolean
  onOpen?: () => void
  /** 动作按钮由调用方注入（plaque 的运行/查看等） */
  actions?: React.ReactNode
  /** 覆盖状态槽（如工作流节点态徽章） */
  statusOverride?: React.ReactNode
  /** 窄容器（编辑器侧栏）可关掉 ID 行 */
  showId?: boolean
  showKind?: boolean
  /** 追加到 meta 行尾的额外信息（如展柜的「N 原子，未渲染」） */
  metaExtra?: React.ReactNode
  className?: string
}

/**
 * 任务卡片预设：JobSummary → MoleculeCard 槽位。
 * 文案一律来自 domain/jobPresentation（词汇单源）。
 */
export function JobCard({
  job,
  variant = 'row',
  molecule,
  selected,
  onOpen,
  actions,
  statusOverride,
  showId = true,
  showKind = true,
  metaExtra,
  className,
}: JobCardProps) {
  const terminal = isTerminalJobStatus(job.status)
  return (
    <MoleculeCard
      variant={variant}
      title={job.name || calculationLabel(job.kind)}
      visual={<JobVisual job={job} {...(molecule !== undefined ? { molecule } : {})} />}
      status={statusOverride ?? <JobStatusBadge status={job.status} size="sm" />}
      kind={showKind ? <Chip title={calculationLabel(job.kind)}>{calculationLabel(job.kind)}</Chip> : undefined}
      meta={
        <>
          {showId && <MonoId value={job.id} />}
          <ElapsedTime
            since={job.createdAt}
            {...(terminal && job.updatedAt !== undefined ? { until: job.updatedAt } : {})}
            prefix="耗时 "
          />
          {metaExtra}
        </>
      }
      {...(selected !== undefined ? { selected } : {})}
      {...(onOpen ? { onClick: onOpen } : {})}
      {...(actions !== undefined ? { actions } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  )
}
