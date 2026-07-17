import type { JobArtifact, JobDetail, JobStatus } from './jobTypes'
import { isPsi4Request, isXtbRequest, literalAtomCount } from './jobRequest'

export function calculationLabel(kind: string): string {
  if (kind === 'xtb-optimization') return 'xTB 几何优化'
  if (kind === 'psi4-frequency') return 'Psi4 频率分析'
  if (kind === 'psi4-ts-refine') return 'Psi4 过渡态精修'
  if (kind === 'psi4-irc') return 'Psi4 IRC'
  return kind
}

export function jobStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    created: '已创建',
    queued: '等待中',
    running: '运行中',
    succeeded: '已完成',
    failed: '失败',
    cancelled: '已取消',
    interrupted: '已中断',
  }
  return labels[status]
}

export function formatJobDate(value: string | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

/**
 * 任务耗时:终态用 createdAt→updatedAt,进行中外层传 undefined endIso 表示"至今"。
 * 输出形如 45s / 12m / 2h 14m / 1d 3h。
 */
export function formatJobDuration(startIso: string | undefined, endIso?: string | undefined): string {
  if (!startIso) return '—'
  const start = new Date(startIso).getTime()
  const end = endIso ? new Date(endIso).getTime() : Date.now()
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '—'
  const seconds = Math.floor((end - start) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return minutes % 60 === 0 ? `${hours}h` : `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return hours % 24 === 0 ? `${days}d` : `${days}d ${hours % 24}h`
}

export function formatArtifactSize(size: number | undefined): string {
  if (size === undefined) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export interface JobParameterRowsOptions {
  /** compact 省略 Psi4 的线程/内存行，适合侧栏等窄布局；full 为超集。 */
  variant?: 'compact' | 'full'
}

export function jobParameterRows(
  job: JobDetail,
  options: JobParameterRowsOptions = {},
): Array<[string, string]> {
  const variant = options.variant ?? 'full'
  const request = job.request
  const rows: Array<[string, string]> = [
    ['任务类型', calculationLabel(job.kind)],
    ['原子', literalAtomCount(job) ?? '版本快照'],
    ['电荷', request ? String(request.charge) : '—'],
    ['多重度', request ? String(request.multiplicity) : '—'],
  ]
  if (isXtbRequest(request)) {
    rows.push(['方法', 'GFN2-xTB'], ['优化级别', request.optLevel], ['最大步数', String(request.maxSteps)])
  } else if (isPsi4Request(request)) {
    rows.push(['理论水平', `${request.method}/${request.basis}`], ['SCF', request.scfType.toUpperCase()])
    if (variant === 'full') {
      rows.push(['线程', String(request.threads)], ['内存', `${request.memoryMb} MB`])
    }
    if ('maxSteps' in request) rows.push(['最大步数', String(request.maxSteps)])
    if ('direction' in request) rows.push(['IRC 方向', request.direction], ['IRC 点数', String(request.points)])
    if ('convergence' in request) rows.push(['收敛标准', request.convergence])
  }
  return rows
}

export function shortIdentifier(value: string): string {
  return value.length <= 20 ? value : `${value.slice(0, 12)}…${value.slice(-6)}`
}

export function canPreviewArtifact(artifact: JobArtifact): boolean {
  return artifact.mediaType?.startsWith('text/')
    || artifact.mediaType?.startsWith('image/')
    || ['json', 'log', 'psi4-json', 'trajectory-json', 'irc-trajectory-json', 'png'].includes(artifact.format)
}

/** 状态 → StatusPill 色调（词汇单源：与 jobStatusLabel 配对使用）。 */
export function jobStatusTone(status: JobStatus): 'neutral' | 'success' | 'danger' | 'info' | 'emphasis' {
  if (status === 'succeeded') return 'success'
  if (status === 'failed' || status === 'cancelled' || status === 'interrupted') return 'danger'
  if (status === 'running') return 'emphasis'
  return 'neutral'
}
