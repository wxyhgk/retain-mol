import type { JobArtifact, JobStatus } from './jobTypes'

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

export function formatArtifactSize(size: number | undefined): string {
  if (size === undefined) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function canPreviewArtifact(artifact: JobArtifact): boolean {
  return artifact.mediaType?.startsWith('text/')
    || artifact.mediaType?.startsWith('image/')
    || ['json', 'log', 'psi4-json', 'trajectory-json', 'irc-trajectory-json', 'png'].includes(artifact.format)
}
