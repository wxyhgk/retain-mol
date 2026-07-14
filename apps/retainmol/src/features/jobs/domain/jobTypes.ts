import type { Molecule } from '@retainmol/mol-viewer/core'

export type JobKind = 'xtb-optimization'

export type JobStatus =
  | 'created'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | (string & {})

export interface XtbAtomInput {
  id: string
  symbol: string
  x: number
  y: number
  z: number
}

export interface XtbStructureInput {
  name?: string
  atoms: XtbAtomInput[]
}

export interface CreateXtbOptimizationJobRequest {
  name?: string
  structure: XtbStructureInput
  /** Complete editable graph retained so an optimized job can restore its molecule. */
  molecule?: Molecule
  charge: number
  multiplicity: number
  method: 'gfn2'
  maxSteps: number
  optLevel: 'normal' | 'tight' | 'vtight'
}

export type JobArtifactRole = 'input' | 'output' | 'preview'

export interface JobArtifact {
  id: string
  jobId: string
  role: JobArtifactRole
  name: string
  format: string
  mediaType?: string
  sizeBytes?: number
  createdAt?: string
  downloadUrl?: string
  metadata?: Record<string, unknown>
}

export interface JobSummary {
  id: string
  kind: JobKind
  status: JobStatus
  name: string
  createdAt: string
  updatedAt?: string
  artifacts?: JobArtifact[]
}

export interface JobDetail extends JobSummary {
  request: CreateXtbOptimizationJobRequest
  message?: string
  error?: string
  artifacts?: JobArtifact[]
}

export interface JobsApi {
  listJobs(options?: { signal?: AbortSignal }): Promise<JobSummary[]>
  createXtbOptimizationJob(
    request: CreateXtbOptimizationJobRequest,
    options?: { signal?: AbortSignal },
  ): Promise<JobDetail>
  getJob(jobId: string, options?: { signal?: AbortSignal }): Promise<JobDetail>
  listJobArtifacts(jobId: string, options?: { signal?: AbortSignal }): Promise<JobArtifact[]>
  uploadJobThumbnail(jobId: string, dataUrl: string, options?: { signal?: AbortSignal }): Promise<JobArtifact>
  runJob(jobId: string, options?: { signal?: AbortSignal }): Promise<JobDetail>
}
