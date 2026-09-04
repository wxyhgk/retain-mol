import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Clock, LoaderCircle, XCircle } from 'lucide-react'
import { cn } from '@retainmol/ui-kit'
import type { JobStatus } from '../../domain/jobTypes'
import { jobStatusLabel } from '../../domain/jobPresentation'

function glyph(status: JobStatus, className: string): ReactNode {
  switch (status) {
    case 'succeeded':
      return <CheckCircle2 className={className} />
    case 'running':
      return <LoaderCircle className={cn(className, 'animate-spin')} />
    case 'queued':
    case 'created':
      return <Clock className={className} />
    case 'failed':
    case 'interrupted':
      return <AlertTriangle className={className} />
    case 'cancelled':
      return <XCircle className={className} />
  }
}

function palette(status: JobStatus) {
  // 浅色底上的化学语义:反应中=teal、异常=rose、完成=emerald、未开始=slate
  if (status === 'running') return 'text-teal-600'
  if (status === 'failed' || status === 'interrupted') return 'text-rose-600'
  if (status === 'succeeded') return 'text-emerald-600'
  return 'text-slate-400'
}

/**
 * 苯环六边形状态标:化学风格的任务状态指示。
 * 用在任务卡、依赖图节点等"分子感"场景;常规列表仍用 JobStatusBadge。
 */
export function ChemStatusHex({ status, size = 'default', className }: {
  status: JobStatus
  size?: 'sm' | 'default'
  className?: string
}) {
  return (
    <span
      role="img"
      aria-label={jobStatusLabel(status)}
      title={jobStatusLabel(status)}
      className={cn('relative inline-grid shrink-0 place-items-center', size === 'sm' ? 'size-4' : 'size-5', palette(status), className)}
    >
      <svg viewBox="0 0 24 24" className="absolute inset-0 size-full" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M12 2.2 L20.5 7.1 L20.5 16.9 L12 21.8 L3.5 16.9 L3.5 7.1 Z" />
      </svg>
      {glyph(status, cn('relative', size === 'sm' ? 'size-2' : 'size-2.5'))}
    </span>
  )
}
