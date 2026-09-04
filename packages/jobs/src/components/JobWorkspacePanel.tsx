import { useEffect, useMemo, useState } from 'react'
import { Atom, FlaskConical, LoaderCircle } from 'lucide-react'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Button } from '@retainmol/ui-kit'
import { cn } from '@retainmol/ui-kit'
import type { JobArtifact, JobDetail, XtbStructureInput } from '../domain/jobTypes'
import { filterJobs } from '../domain/jobFilter'
import {
  useJobDetailQuery,
  useJobsQuery,
  useRunJobMutation,
} from '../application/jobQueries'
import { useJobUiStore } from '../model/jobUiStore'
import { XtbJobForm } from './XtbJobForm'
import { Psi4JobForm } from './Psi4JobForm'
import { JobEmptyState } from './shared/JobEmptyState'
import { JobListPane } from './workspace/JobListPane'
import { JobDetailPane } from './workspace/JobDetailPane'
import { type MoleculeDocumentBinding } from '@retainmol/molecule-assets'

export interface JobWorkspacePanelProps {
  structure?: XtbStructureInput
  molecule?: Molecule
  objectId?: string | null
  documentBinding?: MoleculeDocumentBinding | null
  revisionMetadata?: Readonly<Record<string, unknown>>
  onExecuteJob?: (job: JobDetail) => void | Promise<void>
  onLoadOptimizedStructure?: (artifact: JobArtifact, job: JobDetail) => void | Promise<void>
  showCreateForm?: boolean
  autoSelectFirst?: boolean
  className?: string
}

export function JobWorkspacePanel({
  structure,
  molecule,
  objectId,
  documentBinding,
  revisionMetadata,
  onExecuteJob,
  onLoadOptimizedStructure,
  showCreateForm = true,
  autoSelectFirst = false,
  className,
}: JobWorkspacePanelProps) {
  const selectedJobId = useJobUiStore(state => state.selectedJobId)
  const selectJob = useJobUiStore(state => state.selectJob)
  const listFilter = useJobUiStore(state => state.listFilter)
  const jobsQuery = useJobsQuery()
  const detailQuery = useJobDetailQuery(selectedJobId)
  const runJob = useRunJobMutation()
  const [callbackError, setCallbackError] = useState<string | null>(null)
  const [createEngine, setCreateEngine] = useState<'xtb' | 'psi4'>('xtb')
  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])
  const visibleJobs = useMemo(() => filterJobs(jobs, listFilter), [jobs, listFilter])
  const visibleJob = detailQuery.data

  useEffect(() => {
    if (autoSelectFirst && !selectedJobId && visibleJobs.length > 0) selectJob(visibleJobs[0].id)
  }, [autoSelectFirst, visibleJobs, selectJob, selectedJobId])

  async function invokeCallback(callback: () => void | Promise<void>) {
    setCallbackError(null)
    try {
      await callback()
    } catch (error) {
      setCallbackError(error instanceof Error ? error.message : '操作失败。')
    }
  }

  return (
    <section className={cn('grid h-full min-h-0 grid-cols-[minmax(14rem,0.9fr)_minmax(0,1.4fr)] overflow-hidden bg-card text-card-foreground', className)}>
      <JobListPane
        jobs={visibleJobs}
        totalCount={jobs.length}
        isLoading={jobsQuery.isLoading}
        isFetching={jobsQuery.isFetching}
        error={jobsQuery.error}
        selectedJobId={selectedJobId}
        onSelect={selectJob}
        onRefresh={() => void jobsQuery.refetch()}
      />

      <div className="min-h-0 overflow-y-auto">
        {showCreateForm && (
          <div>
            <div className="flex gap-1 border-b border-border bg-muted/30 p-1.5" role="group" aria-label="计算引擎">
              <Button size="sm" variant={createEngine === 'xtb' ? 'default' : 'ghost'} className="h-7 flex-1" onClick={() => setCreateEngine('xtb')}><FlaskConical />xTB</Button>
              <Button size="sm" variant={createEngine === 'psi4' ? 'default' : 'ghost'} className="h-7 flex-1" onClick={() => setCreateEngine('psi4')}><Atom />Psi4</Button>
            </div>
            {createEngine === 'xtb' ? (
              <XtbJobForm
                structure={structure}
                molecule={molecule}
                objectId={objectId}
                documentBinding={documentBinding}
                revisionMetadata={revisionMetadata}
              />
            ) : (
              <Psi4JobForm
                structure={structure}
                molecule={molecule}
                objectId={objectId}
                documentBinding={documentBinding}
                revisionMetadata={revisionMetadata}
              />
            )}
          </div>
        )}
        {(callbackError || detailQuery.error) && (
          <p role="alert" className="mx-3 mt-3 border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
            {callbackError ?? detailQuery.error?.message}
          </p>
        )}
        <div className="p-3">
          {detailQuery.isLoading && <div className="flex items-center gap-2 py-8 text-xs text-muted-foreground"><LoaderCircle className="animate-spin" />正在读取任务</div>}
          {!detailQuery.isLoading && visibleJob && (
            <JobDetailPane
              job={visibleJob}
              onExecute={() => void invokeCallback(async () => {
                const updated = await runJob.mutateAsync(visibleJob.id)
                await onExecuteJob?.(updated)
              })}
              isRunning={runJob.isPending}
              onLoad={onLoadOptimizedStructure
                ? artifact => void invokeCallback(() => onLoadOptimizedStructure(artifact, visibleJob))
                : undefined}
            />
          )}
          {!detailQuery.isLoading && !visibleJob && <JobEmptyState title="选择任务查看参数和产物。" />}
        </div>
      </div>
    </section>
  )
}
