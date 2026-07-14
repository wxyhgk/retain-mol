import { zodResolver } from '@hookform/resolvers/zod'
import { FlaskConical, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  defaultXtbJobFormValues,
  xtbJobFormSchema,
  type XtbJobFormValues,
} from '../domain/xtbJobSchema'
import type { JobDetail, XtbStructureInput } from '../domain/jobTypes'
import { JobsApiError } from '../infrastructure/jobsApiClient'
import { useCreateXtbJobMutation, useUploadJobThumbnailMutation } from '../application/jobQueries'
import { captureViewportImage } from '@/domain/viewer/viewport'

const inputClass = 'h-8 w-full border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-foreground'

export function XtbJobForm({
  structure,
  molecule,
  onCreated,
}: {
  structure?: XtbStructureInput
  molecule?: Molecule
  onCreated?: (job: JobDetail) => void
}) {
  const createJob = useCreateXtbJobMutation()
  const uploadThumbnail = useUploadJobThumbnailMutation()
  const form = useForm<XtbJobFormValues>({
    resolver: zodResolver(xtbJobFormSchema),
    defaultValues: defaultXtbJobFormValues,
  })
  const atomCount = structure?.atoms.length ?? 0
  const hasStructure = atomCount >= 2

  const submit = form.handleSubmit(async values => {
    if (!structure || !hasStructure) {
      form.setError('root', { message: '当前结构至少需要两个原子。' })
      return
    }
    try {
      const job = await createJob.mutateAsync({
        name: values.name || undefined,
        structure,
        ...(molecule ? { molecule } : {}),
        charge: values.charge,
        multiplicity: values.multiplicity,
        method: 'gfn2',
        maxSteps: values.maxSteps,
        optLevel: values.optLevel,
      })
      form.reset(defaultXtbJobFormValues)
      onCreated?.(job)
      const thumbnail = captureViewportImage(0.28)
      if (thumbnail) uploadThumbnail.mutate({ jobId: job.id, dataUrl: thumbnail })
    } catch (error) {
      if (error instanceof JobsApiError) {
        for (const [path, message] of Object.entries(error.fieldErrors)) {
          const field = path.split('.').at(-1)
          if (field && field in defaultXtbJobFormValues) {
            form.setError(field as keyof XtbJobFormValues, { message })
          }
        }
      }
      form.setError('root', { message: error instanceof Error ? error.message : '任务创建失败。' })
    }
  })

  return (
    <form onSubmit={submit} className="border-b border-border p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">新建 xTB 优化</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">GFN2-xTB 几何优化</p>
        </div>
        <span className={cn('border px-1.5 py-0.5 text-[10px]', hasStructure ? 'border-foreground text-foreground' : 'border-border text-muted-foreground')}>
          {atomCount} atoms
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="任务名称" error={form.formState.errors.name?.message} className="col-span-2">
          <input {...form.register('name')} placeholder="可选说明" className={inputClass} />
        </Field>
        <Field label="电荷" error={form.formState.errors.charge?.message}>
          <input type="number" {...form.register('charge', { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="多重度" error={form.formState.errors.multiplicity?.message}>
          <input type="number" min={1} {...form.register('multiplicity', { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="优化级别" error={form.formState.errors.optLevel?.message}>
          <select {...form.register('optLevel')} className={inputClass}>
            <option value="normal">Normal</option>
            <option value="tight">Tight</option>
            <option value="vtight">Very tight</option>
          </select>
        </Field>
        <Field label="最大步数" error={form.formState.errors.maxSteps?.message}>
          <input type="number" min={1} max={1000} {...form.register('maxSteps', { valueAsNumber: true })} className={inputClass} />
        </Field>
      </div>
      {(form.formState.errors.root?.message || createJob.error) && (
        <p role="alert" className="mt-2 text-[11px] text-destructive">
          {form.formState.errors.root?.message ?? createJob.error?.message}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">{hasStructure ? '提交当前可编辑分子图和坐标。' : '请先建立或导入分子结构。'}</p>
        <Button type="submit" size="sm" className="h-8" disabled={!hasStructure || createJob.isPending}>
          {createJob.isPending ? <LoaderCircle className="animate-spin" /> : <FlaskConical />}
          创建
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('grid gap-1 text-[11px] font-medium text-muted-foreground', className)}>
      {label}
      {children}
      {error && <span className="font-normal text-destructive">{error}</span>}
    </label>
  )
}
