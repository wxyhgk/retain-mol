import { zodResolver } from '@hookform/resolvers/zod'
import { FlaskConical, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Button } from '@retainmol/ui-kit'
import { Field } from '@retainmol/ui-kit'
import { Input } from '@retainmol/ui-kit'
import { NativeSelect } from '@retainmol/ui-kit'
import { cn } from '@retainmol/ui-kit'
import {
  defaultXtbJobFormValues,
  xtbJobFormSchema,
  type XtbJobFormValues,
} from '../domain/xtbJobSchema'
import type { JobDetail, XtbStructureInput } from '../domain/jobTypes'
import { JobsApiError } from '../infrastructure/jobsApiClient'
import { useCaptureJobThumbnail } from '../application/jobThumbnailCapture'
import { useSubmitXtbJobFromEditor } from '../application/submitXtbJobFromEditor'
import type { MoleculeDocumentBinding } from '@retainmol/molecule-assets'


export function XtbJobForm({
  structure,
  molecule,
  objectId,
  documentBinding,
  revisionMetadata,
  onCreated,
}: {
  structure?: XtbStructureInput
  molecule?: Molecule
  objectId?: string | null
  documentBinding?: MoleculeDocumentBinding | null
  revisionMetadata?: Readonly<Record<string, unknown>>
  onCreated?: (job: JobDetail) => void
}) {
  const submitJob = useSubmitXtbJobFromEditor()
  const captureThumbnail = useCaptureJobThumbnail()
  const form = useForm<XtbJobFormValues>({
    resolver: zodResolver(xtbJobFormSchema),
    defaultValues: defaultXtbJobFormValues,
  })
  const atomCount = structure?.atoms.length ?? 0
  const hasStructure = atomCount >= 2

  const submit = form.handleSubmit(async values => {
    if (!structure || !molecule || !objectId || !hasStructure) {
      form.setError('root', { message: '当前结构至少需要两个原子。' })
      return
    }
    try {
      const { job } = await submitJob.submit({
        objectId,
        molecule,
        binding: documentBinding ?? null,
        revisionMetadata,
        parameters: {
          name: values.name || undefined,
          charge: values.charge,
          multiplicity: values.multiplicity,
          method: 'gfn2',
          maxSteps: values.maxSteps,
          optLevel: values.optLevel,
        },
      })
      form.reset(defaultXtbJobFormValues)
      onCreated?.(job)
      captureThumbnail(job.id)
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
          <Input {...form.register('name')} placeholder="可选说明" className="h-8 px-2 text-xs" />
        </Field>
        <Field label="电荷" error={form.formState.errors.charge?.message}>
          <Input type="number" {...form.register('charge', { valueAsNumber: true })} className="h-8 px-2 text-xs" />
        </Field>
        <Field label="多重度" error={form.formState.errors.multiplicity?.message}>
          <Input type="number" min={1} {...form.register('multiplicity', { valueAsNumber: true })} className="h-8 px-2 text-xs" />
        </Field>
        <Field label="优化级别" error={form.formState.errors.optLevel?.message}>
          <NativeSelect {...form.register('optLevel')} className="h-8 px-2 text-xs">
            <option value="normal">Normal</option>
            <option value="tight">Tight</option>
            <option value="vtight">Very tight</option>
          </NativeSelect>
        </Field>
        <Field label="最大步数" error={form.formState.errors.maxSteps?.message}>
          <Input type="number" min={1} max={1000} {...form.register('maxSteps', { valueAsNumber: true })} className="h-8 px-2 text-xs" />
        </Field>
      </div>
      {(form.formState.errors.root?.message || submitJob.error) && (
        <p role="alert" className="mt-2 text-[11px] text-destructive">
          {form.formState.errors.root?.message ?? submitJob.error?.message}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">{hasStructure ? '先保存不可变分子版本，再提交计算。' : '请先建立或导入分子结构。'}</p>
        <Button type="submit" size="sm" className="h-8" disabled={!hasStructure || !objectId || submitJob.isPending}>
          {submitJob.isPending ? <LoaderCircle className="animate-spin" /> : <FlaskConical />}
          {submitJob.isPending ? '保存并创建' : '创建'}
        </Button>
      </div>
    </form>
  )
}

