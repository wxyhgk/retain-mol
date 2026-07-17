import { formatDuration, useNowTick } from '../hooks/use-ticker'
import { cn } from '../utils'

function toMs(value: string | number): number {
  return typeof value === 'number' ? value : Date.parse(value)
}

function Body({ text, prefix, className }: { text: string; prefix?: string; className?: string }) {
  return (
    <span className={cn('tabular-nums text-[10px] text-muted-foreground', className)}>
      {prefix}
      {text}
    </span>
  )
}

function LiveElapsed({ since, prefix, className }: { since: number; prefix?: string; className?: string }) {
  const nowMs = useNowTick()
  return <Body text={formatDuration(nowMs - since)} prefix={prefix} className={className} />
}

/**
 * 耗时显示：给 until 则静态（不订阅心跳），不给则订阅全局 1s 心跳跳动。
 * since/until 接受 ISO 字符串或毫秒时间戳。
 */
export function ElapsedTime({ since, until, prefix, className }: {
  since: string | number
  until?: string | number
  prefix?: string
  className?: string
}) {
  const sinceMs = toMs(since)
  if (until !== undefined) {
    return <Body text={formatDuration(toMs(until) - sinceMs)} prefix={prefix} className={className} />
  }
  return <LiveElapsed since={sinceMs} prefix={prefix} className={className} />
}
