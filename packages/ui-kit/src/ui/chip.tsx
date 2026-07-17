import { cn } from '../utils'

/** 小标签片：方法水平、类型、原子数等短信息的统一容器。 */
export function Chip({ children, mono = false, title, className }: {
  children: React.ReactNode
  /** 等宽字体（适合方法字符串/数值） */
  mono?: boolean
  title?: string
  className?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex max-w-full items-center gap-1 truncate border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground',
        mono && 'font-mono',
        className,
      )}
    >
      {children}
    </span>
  )
}
