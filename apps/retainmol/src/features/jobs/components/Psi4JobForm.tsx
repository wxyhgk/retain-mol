import { zodResolver } from '@hookform/resolvers/zod'
import { Atom, LoaderCircle } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MoleculeDocumentBinding } from '@/features/molecule-assets'
import { captureViewportImage } from '@/domain/viewer/viewport'
import { useUploadJobThumbnailMutation } from '../application/jobQueries'
import { useSubmitPsi4JobFromEditor } from '../application/submitPsi4JobFromEditor'
import type {
  JobDetail,
  Psi4CommonJobParameters,
  Psi4IrcJobParameters,
  Psi4TsRefineJobParameters,
  XtbStructureInput,
} from '../domain/jobTypes'
import {
  defaultPsi4JobFormValues,
  psi4JobFormSchema,
  type Psi4JobFormValues,
} from '../domain/psi4JobSchema'
import { JobsApiError } from '../infrastructure/jobsApiClient'

const inputClass = 'h-8 w-full border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-foreground'

export function Psi4JobForm({
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
  const submitJob = useSubmitPsi4JobFromEditor()
  const uploadThumbnail = useUploadJobThumbnailMutation()
  const form = useForm<Psi4JobFormValues>({
    resolver: zodResolver(psi4JobFormSchema),
    defaultValues: defaultPsi4JobFormValues,
  })
  const kind = useWatch({ control: form.control, name: 'kind' })
  const atomCount = structure?.atoms.length ?? 0
  const hasStructure = atomCount >= 2

  const submit = form.handleSubmit(async values => {
    if (!structure || !molecule || !objectId || !hasStructure) {
      form.setError('root', { message: '当前结构至少需要两个原子。' })
      return
    }
    const common: Psi4CommonJobParameters = {
      name: values.name || undefined,
      charge: values.charge,
      multiplicity: values.multiplicity,
      method: values.method,
      basis: values.basis,
      reference: values.reference === 'auto' ? undefined : values.reference,
      scfType: values.scfType,
      threads: values.threads,
      memoryMb: values.memoryMb,
      timeoutSeconds: values.timeoutSeconds,
    }
    try {
      let result: { job: JobDetail }
      if (values.kind === 'psi4-ts-refine') {
        const parameters: Psi4TsRefineJobParameters = {
          ...common,
          maxSteps: values.maxSteps,
          fullHessianEvery: values.fullHessianEvery,
          convergence: values.convergence,
        }
        result = await submitJob.submit({
          objectId, molecule, binding: documentBinding ?? null, revisionMetadata,
          kind: values.kind, parameters,
        })
      } else if (values.kind === 'psi4-irc') {
        const parameters: Psi4IrcJobParameters = {
          ...common,
          direction: values.direction,
          points: values.points,
          stepSize: values.stepSize,
          maxSteps: values.maxSteps,
        }
        result = await submitJob.submit({
          objectId, molecule, binding: documentBinding ?? null, revisionMetadata,
          kind: values.kind, parameters,
        })
      } else {
        result = await submitJob.submit({
          objectId, molecule, binding: documentBinding ?? null, revisionMetadata,
          kind: values.kind, parameters: common,
        })
      }
      onCreated?.(result.job)
      const thumbnail = captureViewportImage(0.28)
      if (thumbnail) uploadThumbnail.mutate({ jobId: result.job.id, dataUrl: thumbnail })
    } catch (error) {
      if (error instanceof JobsApiError) {
        for (const [path, message] of Object.entries(error.fieldErrors)) {
          const field = path.split('.').at(-1)
          if (field && field in defaultPsi4JobFormValues) {
            form.setError(field as keyof Psi4JobFormValues, { message })
          }
        }
      }
      form.setError('root', { message: error instanceof Error ? error.message : 'Psi4 任务创建失败。' })
    }
  })

  return (
    <form onSubmit={submit} className="border-b border-border p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">新建 Psi4 计算</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">过渡态、频率与 IRC</p>
        </div>
        <span className="text-[10px] text-muted-foreground">{atomCount} atoms</span>
      </div>
      <div className="grid grid-cols-3 gap-1" role="group" aria-label="Psi4 任务类型">
        {([
          ['psi4-frequency', '频率'],
          ['psi4-ts-refine', 'TS 精修'],
          ['psi4-irc', 'IRC'],
        ] as const).map(([value, label]) => (
          <Button key={value} type="button" size="sm" variant={kind === value ? 'default' : 'outline'} className="h-8" onClick={() => form.setValue('kind', value)}>
            {label}
          </Button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="任务名称" className="col-span-2" error={form.formState.errors.name?.message}>
          <input {...form.register('name')} placeholder="可选" className={inputClass} />
        </Field>
        <Field label="方法" error={form.formState.errors.method?.message}>
          <input {...form.register('method')} className={inputClass} />
        </Field>
        <Field label="基组" error={form.formState.errors.basis?.message}>
          <input {...form.register('basis')} className={inputClass} />
        </Field>
        <Field label="电荷" error={form.formState.errors.charge?.message}>
          <input type="number" {...form.register('charge', { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="多重度" error={form.formState.errors.multiplicity?.message}>
          <input type="number" {...form.register('multiplicity', { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="参考波函数">
          <select {...form.register('reference')} className={inputClass}>
            <option value="auto">自动</option><option value="rhf">RHF</option><option value="uhf">UHF</option><option value="rohf">ROHF</option>
          </select>
        </Field>
        <Field label="SCF 类型">
          <select {...form.register('scfType')} className={inputClass}><option value="df">DF</option><option value="pk">PK</option></select>
        </Field>
        {kind !== 'psi4-frequency' && (
          <Field label="最大步数" error={form.formState.errors.maxSteps?.message}>
            <input type="number" {...form.register('maxSteps', { valueAsNumber: true })} className={inputClass} />
          </Field>
        )}
        {kind === 'psi4-ts-refine' && (
          <>
            <Field label="Hessian 间隔" error={form.formState.errors.fullHessianEvery?.message}>
              <input type="number" {...form.register('fullHessianEvery', { valueAsNumber: true })} className={inputClass} />
            </Field>
            <Field label="收敛标准" className="col-span-2">
              <select {...form.register('convergence')} className={inputClass}>
                <option value="gau_loose">Gaussian loose</option><option value="gau">Gaussian</option><option value="gau_tight">Gaussian tight</option><option value="gau_verytight">Gaussian very tight</option>
              </select>
            </Field>
          </>
        )}
        {kind === 'psi4-irc' && (
          <>
            <Field label="方向"><select {...form.register('direction')} className={inputClass}><option value="both">双向</option><option value="forward">正向</option><option value="backward">反向</option></select></Field>
            <Field label="每向点数" error={form.formState.errors.points?.message}><input type="number" {...form.register('points', { valueAsNumber: true })} className={inputClass} /></Field>
            <Field label="步长" error={form.formState.errors.stepSize?.message}><input type="number" step="0.01" {...form.register('stepSize', { valueAsNumber: true })} className={inputClass} /></Field>
          </>
        )}
        <Field label="线程" error={form.formState.errors.threads?.message}><input type="number" {...form.register('threads', { valueAsNumber: true })} className={inputClass} /></Field>
        <Field label="内存 (MB)" error={form.formState.errors.memoryMb?.message}><input type="number" step="256" {...form.register('memoryMb', { valueAsNumber: true })} className={inputClass} /></Field>
        <Field label="超时 (秒)" error={form.formState.errors.timeoutSeconds?.message}><input type="number" {...form.register('timeoutSeconds', { valueAsNumber: true })} className={inputClass} /></Field>
      </div>
      {(form.formState.errors.root?.message || submitJob.error) && <p role="alert" className="mt-2 text-[11px] text-destructive">{form.formState.errors.root?.message ?? submitJob.error?.message}</p>}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">{hasStructure ? '创建后手动运行，输入绑定到当前不可变版本。' : '请先建立或导入分子结构。'}</p>
        <Button type="submit" size="sm" className="h-8" disabled={!hasStructure || !objectId || submitJob.isPending}>
          {submitJob.isPending ? <LoaderCircle className="animate-spin" /> : <Atom />}
          {submitJob.isPending ? '保存并创建' : '创建'}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <label className={cn('grid gap-1 text-[11px] font-medium text-muted-foreground', className)}>{label}{children}{error && <span className="font-normal text-destructive">{error}</span>}</label>
}
