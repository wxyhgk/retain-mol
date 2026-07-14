import * as React from 'react'
import { FileWarning, Upload } from 'lucide-react'
import {
  useDropzone,
  type DropzoneInputProps,
  type DropzoneOptions,
  type FileRejection,
} from 'react-dropzone'

import { cn } from '@/lib/utils'

export interface FileDropzoneRenderState {
  acceptedFiles: readonly File[]
  fileRejections: readonly FileRejection[]
  isDragAccept: boolean
  isDragActive: boolean
  isDragReject: boolean
  open: () => void
}

export interface FileDropzoneProps
  extends Partial<Omit<DropzoneOptions, 'disabled' | 'onDrop'>> {
  /** A concise label for both the visible control and its accessible name. */
  label: string
  description?: React.ReactNode
  onDrop: NonNullable<DropzoneOptions['onDrop']>
  disabled?: boolean
  className?: string
  children?: React.ReactNode | ((state: FileDropzoneRenderState) => React.ReactNode)
}

export function FileDropzone({
  label,
  description,
  onDrop,
  disabled = false,
  className,
  children,
  ...options
}: FileDropzoneProps) {
  const descriptionId = React.useId()
  const {
    acceptedFiles,
    fileRejections,
    getInputProps,
    getRootProps,
    isDragAccept,
    isDragActive,
    isDragReject,
    isFocused,
    open,
  } = useDropzone({
    multiple: options.multiple,
    onDragEnter: options.onDragEnter,
    onDragLeave: options.onDragLeave,
    onDragOver: options.onDragOver,
    ...options,
    disabled,
    onDrop,
  })

  const state: FileDropzoneRenderState = {
    acceptedFiles,
    fileRejections,
    isDragAccept,
    isDragActive,
    isDragReject,
    open,
  }
  const content = typeof children === 'function' ? children(state) : children
  const hasCustomContent = content !== null && content !== undefined
  const { refKey: inputRefKey, ...inputProps } = getInputProps<DropzoneInputProps>()
  void inputRefKey

  return (
    <div
      {...getRootProps({
        'aria-describedby': description ? descriptionId : undefined,
        'aria-disabled': disabled || undefined,
        'aria-label': label,
        role: 'button',
      })}
      className={cn(
        'group flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background p-5 text-center',
        'outline-none transition-colors hover:border-foreground/40 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring',
        isFocused && 'ring-2 ring-ring',
        isDragActive && 'border-foreground/50 bg-muted/50',
        isDragAccept && 'border-emerald-600 bg-emerald-50 text-emerald-950',
        isDragReject && 'border-destructive bg-destructive/5 text-destructive',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input {...inputProps} aria-label={label} />
      {hasCustomContent && description && (
        <div id={descriptionId} className="sr-only">
          {description}
        </div>
      )}
      {content ?? (
        <>
          <span className="flex size-9 items-center justify-center rounded-md border border-border bg-background" aria-hidden="true">
            {isDragReject ? <FileWarning className="size-4" /> : <Upload className="size-4" />}
          </span>
          <span className="text-sm font-medium text-foreground">{label}</span>
          {description && (
            <div id={descriptionId} className="text-xs text-muted-foreground">
              {description}
            </div>
          )}
          {isDragReject && (
            <span className="text-xs" role="alert">The selected files are not accepted.</span>
          )}
        </>
      )}
    </div>
  )
}
