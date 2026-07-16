import type { Molecule } from '@retainmol/mol-viewer/core'

/** Engine adapters own concrete values; the shared task center must accept future kinds. */
export type JobKind = string

export type JobStatus =
  | 'created'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'interrupted'

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

export type Psi4CalculationKind = 'psi4-ts-refine' | 'psi4-frequency' | 'psi4-irc'

export interface Psi4CommonJobParameters {
  name?: string
  charge: number
  multiplicity: number
  method: string
  basis: string
  reference?: 'rhf' | 'uhf' | 'rohf'
  scfType: 'df' | 'pk'
  threads: number
  memoryMb: number
  timeoutSeconds: number
}

export interface Psi4TsRefineJobParameters extends Psi4CommonJobParameters {
  maxSteps: number
  fullHessianEvery: number
  convergence: 'gau_loose' | 'gau' | 'gau_tight' | 'gau_verytight'
}

export type Psi4FrequencyJobParameters = Psi4CommonJobParameters

export interface Psi4IrcJobParameters extends Psi4CommonJobParameters {
  direction: 'forward' | 'backward' | 'both'
  points: number
  stepSize: number
  maxSteps: number
}

export type Psi4JobParametersByKind = {
  'psi4-ts-refine': Psi4TsRefineJobParameters
  'psi4-frequency': Psi4FrequencyJobParameters
  'psi4-irc': Psi4IrcJobParameters
}

export type Psi4StructureSource =
  | {
      structure: XtbStructureInput
      molecule?: Molecule
      moleculeRevisionId?: never
      artifactId?: never
    }
  | {
      moleculeRevisionId: string
      structure?: never
      molecule?: never
      artifactId?: never
    }
  | {
      artifactId: string
      structure?: never
      molecule?: never
      moleculeRevisionId?: never
    }

export type CreatePsi4TsRefineJobRequest = Psi4TsRefineJobParameters & Psi4StructureSource
export type CreatePsi4FrequencyJobRequest = Psi4FrequencyJobParameters & Psi4StructureSource
export type CreatePsi4IrcJobRequest = Psi4IrcJobParameters & Psi4StructureSource
export type CreatePsi4JobRequest =
  | CreatePsi4TsRefineJobRequest
  | CreatePsi4FrequencyJobRequest
  | CreatePsi4IrcJobRequest

export type Psi4CreateMutationInput = {
  [Kind in Psi4CalculationKind]: {
    kind: Kind
    request: Psi4JobParametersByKind[Kind] & Psi4StructureSource
  }
}[Psi4CalculationKind]

export interface CreateXtbOptimizationJobParameters {
  name?: string
  charge: number
  multiplicity: number
  method: 'gfn2'
  maxSteps: number
  optLevel: 'normal' | 'tight' | 'vtight'
}

export type CreateXtbOptimizationJobRequest = CreateXtbOptimizationJobParameters & (
  | {
      structure: XtbStructureInput
      /** Complete editable graph retained so an optimized job can restore its molecule. */
      molecule?: Molecule
      moleculeRevisionId?: never
    }
  | {
      moleculeRevisionId: string
      structure?: never
      molecule?: never
    }
)

export type JobArtifactRole = 'input' | 'output' | 'preview'

export interface JobArtifact {
  id: string
  jobId: string
  role: JobArtifactRole
  name: string
  format: string
  mediaType?: string
  sha256?: string
  sizeBytes?: number
  createdAt?: string
  downloadUrl?: string
  metadata?: Record<string, unknown>
}

export interface JobSummary {
  id: string
  supersedesJobId?: string
  kind: JobKind
  status: JobStatus
  name: string
  description?: string
  createdAt: string
  updatedAt?: string
  artifacts?: JobArtifact[]
}

export interface JobDetail extends JobSummary {
  request?: CreateXtbOptimizationJobRequest | CreatePsi4JobRequest
  message?: string
  error?: string
  artifacts?: JobArtifact[]
}

export interface UpdateJobRequest {
  name?: string
  description?: string | null
}

export interface CloneJobRequest {
  name?: string
}

export interface JobLogSnapshot {
  content: string
  cursor: number
  source: string | null
  complete: boolean
}

export interface JobsApi {
  listJobs(options?: { signal?: AbortSignal }): Promise<JobSummary[]>
  createXtbOptimizationJob(
    request: CreateXtbOptimizationJobRequest,
    options?: { signal?: AbortSignal },
  ): Promise<JobDetail>
  createPsi4TsRefineJob(
    request: CreatePsi4TsRefineJobRequest,
    options?: { signal?: AbortSignal },
  ): Promise<JobDetail>
  createPsi4FrequencyJob(
    request: CreatePsi4FrequencyJobRequest,
    options?: { signal?: AbortSignal },
  ): Promise<JobDetail>
  createPsi4IrcJob(
    request: CreatePsi4IrcJobRequest,
    options?: { signal?: AbortSignal },
  ): Promise<JobDetail>
  getJob(jobId: string, options?: { signal?: AbortSignal }): Promise<JobDetail>
  updateJob(jobId: string, request: UpdateJobRequest, options?: { signal?: AbortSignal }): Promise<JobDetail>
  cloneJob(jobId: string, request?: CloneJobRequest, options?: { signal?: AbortSignal }): Promise<JobDetail>
  retryJob(jobId: string, request?: CloneJobRequest, options?: { signal?: AbortSignal }): Promise<JobDetail>
  cancelJob(jobId: string, options?: { signal?: AbortSignal }): Promise<JobDetail>
  deleteJob(jobId: string, options?: { signal?: AbortSignal }): Promise<void>
  listJobArtifacts(jobId: string, options?: { signal?: AbortSignal }): Promise<JobArtifact[]>
  getJobArtifactText(jobId: string, artifactId: string, options?: { signal?: AbortSignal }): Promise<string>
  getJobLog(jobId: string, cursor?: number, options?: { signal?: AbortSignal }): Promise<JobLogSnapshot>
  uploadJobThumbnail(jobId: string, dataUrl: string, options?: { signal?: AbortSignal }): Promise<JobArtifact>
  runJob(jobId: string, options?: { signal?: AbortSignal }): Promise<JobDetail>
}
