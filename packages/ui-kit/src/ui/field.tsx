import * as React from "react"

import { cn } from "../utils"

/** 表单字段：标签 + 控件 + 内联错误，用 <label> 包裹保证点击聚焦。 */
export function Field({ label, error, className, children }: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn("grid gap-1 text-[11px] font-medium text-muted-foreground", className)}>
      {label}
      {children}
      {error && <span className="font-normal text-destructive">{error}</span>}
    </label>
  )
}
