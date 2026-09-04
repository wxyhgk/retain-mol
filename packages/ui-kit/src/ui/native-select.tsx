import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "../utils"

/** 原生 <select> 的样式包装：与 Input 对齐，且直接兼容 react-hook-form 的 register()。 */
const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
