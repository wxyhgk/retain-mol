import { useState } from 'react'
import { cn } from '../utils'

/** 中段省略：保留头尾，比尾部截断更利于辨认 ID。 */
export function middleEllipsis(value: string, maxLength = 20): string {
  if (value.length <= maxLength) return value
  const head = Math.max(4, Math.floor((maxLength - 1) * 0.6))
  const tail = Math.max(4, maxLength - 1 - head)
  return `${value.slice(0, head)}…${value.slice(-tail)}`
}

/** 等宽 ID 展示，点击复制完整值。 */
export function MonoId({ value, maxLength = 24, className }: {
  value: string
  maxLength?: number
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 剪贴板不可用（非安全上下文等）时静默降级为纯展示
    }
  }

  return (
    <button
      type="button"
      title={copied ? '已复制' : `${value}（点击复制）`}
      onClick={() => void copy()}
      className={cn('inline-flex max-w-full items-center font-mono text-[10px] text-muted-foreground hover:text-foreground', className)}
    >
      <span className="truncate">{copied ? '已复制' : middleEllipsis(value, maxLength)}</span>
    </button>
  )
}
