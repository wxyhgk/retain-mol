import type {
  CreateXtbOptimizationJobRequest,
  JobArtifact,
  JobArtifactRole,
  JobDetail,
  JobStatus,
  JobSummary,
  XtbAtomInput,
  XtbStructureInput,
} from '../domain/jobTypes'

export type NormalizedJobStatus =
  | 'created'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'interrupted'

export type ProjectedJob = JobSummary & Partial<Pick<JobDetail, 'request' | 'message' | 'error'>>

type JsonObject = Record<string, unknown>

const statusAliases: Record<string, NormalizedJobStatus> = {
  created: 'created',
  new: 'created',
  pending: 'queued',
  queued: 'queued',
  scheduled: 'queued',
  waiting: 'queued',
  running: 'running',
  started: 'running',
  processing: 'running',
  in_progress: 'running',
  succeeded: 'succeeded',
  success: 'succeeded',
  completed: 'succeeded',
  complete: 'succeeded',
  done: 'succeeded',
  failed: 'failed',
  failure: 'failed',
  error: 'failed',
  errored: 'failed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  interrupted: 'interrupted',
  aborted: 'interrupted',
}

export function isJobWire(value: unknown): value is JsonObject {
  if (!isObject(value)) return false
  return readNonEmptyString(value, 'id', 'jobId', 'job_id') !== undefined
    && readNonEmptyString(value, 'kind', 'taskType', 'task_type') !== undefined
    && readNonEmptyString(value, 'createdAt', 'created_at') !== undefined
    && (!hasOwn(value, 'artifacts') || Array.isArray(value.artifacts))
}

export function isJobArtifactWire(value: unknown): value is JsonObject {
  if (!isObject(value)) return false
  return readNonEmptyString(value, 'id', 'artifactId', 'artifact_id') !== undefined
    && readNonEmptyString(value, 'jobId', 'job_id') !== undefined
    && readNonEmptyString(value, 'name') !== undefined
}

export function normalizeJobStatus(
  value: unknown,
  fallback: NormalizedJobStatus = 'failed',
): NormalizedJobStatus {
  if (typeof value !== 'string') return fallback
  const key = value.trim().toLowerCase().replace(/[\s-]+/g, '_')
  return statusAliases[key] ?? fallback
}

export function projectJobWire(value: unknown): ProjectedJob {
  if (!isJobWire(value)) throw wireError('job')

  const kind = requiredString(value, 'job.kind', 'kind', 'taskType', 'task_type')
  const metadata = objectValue(value.metadata)
  const requestWire = objectValue(value.request) ?? objectValue(metadata?.request)
  const request = kind === 'xtb-optimization' && requestWire
    ? projectJobRequest(requestWire)
    : undefined
  const artifactsWire = Array.isArray(value.artifacts) ? value.artifacts : undefined
  const artifacts = artifactsWire?.map(
    (artifact, index) => projectJobArtifactWire(artifact, `job.artifacts[${index}]`),
  )
  const id = requiredString(value, 'job.id', 'id', 'jobId', 'job_id')
  const createdAt = requiredString(value, 'job.createdAt', 'createdAt', 'created_at')
  const requestName = request?.name
    ?? (request && 'structure' in request ? request.structure?.name : undefined)
  const name = readNonEmptyString(value, 'name')
    ?? readNonEmptyString(metadata, 'name')
    ?? requestName
    ?? (kind === 'xtb-optimization' ? 'xTB optimization' : kind)

  const projected: ProjectedJob = {
    id,
    kind,
    status: normalizeJobStatus(value.status) satisfies JobStatus,
    name,
    createdAt,
  }
  const updatedAt = readNonEmptyString(value, 'updatedAt', 'updated_at')
  const message = readString(value, 'message') ?? readString(metadata, 'message')
  const error = readString(value, 'error')
  if (updatedAt !== undefined) projected.updatedAt = updatedAt
  if (artifacts !== undefined) projected.artifacts = artifacts
  if (request !== undefined) projected.request = request
  if (message !== undefined) projected.message = message
  if (error !== undefined) projected.error = error
  return projected
}

export function projectJobListWire(value: unknown): JobSummary[] {
  const jobs = Array.isArray(value) ? value : isObject(value) ? value.jobs : undefined
  if (!Array.isArray(jobs)) throw wireError('jobs collection')
  return jobs.map((job, index) => projectAt(`jobs[${index}]`, () => projectJobWire(job)))
}

export function projectJobArtifactWire(value: unknown, path = 'artifact'): JobArtifact {
  if (!isJobArtifactWire(value)) throw wireError(path)
  const metadata = objectValue(value.metadata)
  const name = requiredString(value, `${path}.name`, 'name')
  const role = projectArtifactRole(readNonEmptyString(value, 'role') ?? readNonEmptyString(metadata, 'role'))
  const format = readNonEmptyString(value, 'format')
    ?? readNonEmptyString(metadata, 'format')
    ?? fileExtension(name)
    ?? 'file'
  const projected: JobArtifact = {
    id: requiredString(value, `${path}.id`, 'id', 'artifactId', 'artifact_id'),
    jobId: requiredString(value, `${path}.jobId`, 'jobId', 'job_id'),
    role,
    name,
    format,
  }
  const mediaType = readNonEmptyString(value, 'mediaType', 'media_type')
  const sizeBytes = readFiniteNonNegativeNumber(value, 'sizeBytes', 'size_bytes', 'byteSize', 'byte_size')
    ?? readFiniteNonNegativeNumber(metadata, 'sizeBytes', 'size_bytes', 'byteSize', 'byte_size')
  const createdAt = readNonEmptyString(value, 'createdAt', 'created_at')
  const downloadUrl = readNonEmptyString(value, 'downloadUrl', 'download_url')
  if (mediaType !== undefined) projected.mediaType = mediaType
  if (sizeBytes !== undefined) projected.sizeBytes = sizeBytes
  if (createdAt !== undefined) projected.createdAt = createdAt
  if (downloadUrl !== undefined) projected.downloadUrl = downloadUrl
  if (metadata !== undefined) projected.metadata = metadata
  return projected
}

export function projectJobArtifactListWire(value: unknown): JobArtifact[] {
  const artifacts = Array.isArray(value) ? value : isObject(value) ? value.artifacts : undefined
  if (!Array.isArray(artifacts)) throw wireError('artifacts collection')
  return artifacts.map((artifact, index) => projectJobArtifactWire(artifact, `artifacts[${index}]`))
}

function projectJobRequest(value: JsonObject): CreateXtbOptimizationJobRequest | undefined {
  const structureWire = objectValue(value.structure)
  const moleculeRevisionId = readNonEmptyString(
    value,
    'moleculeRevisionId',
    'molecule_revision_id',
  )
  if (!moleculeRevisionId && (!structureWire || !Array.isArray(structureWire.atoms))) {
    return undefined
  }
  const atoms: XtbAtomInput[] = []
  if (structureWire && Array.isArray(structureWire.atoms)) {
    for (const atomWire of structureWire.atoms) {
      const atom = projectAtom(atomWire)
      if (!atom) return undefined
      atoms.push(atom)
    }
  }
  const charge = finiteNumber(value.charge)
  const multiplicity = finiteNumber(value.multiplicity)
  const maxSteps = finiteNumber(readValue(value, 'maxSteps', 'max_steps'))
  const method = value.method
  const optLevel = readValue(value, 'optLevel', 'opt_level')
  if (charge === undefined || multiplicity === undefined || maxSteps === undefined) return undefined
  if (method !== 'gfn2' || (optLevel !== 'normal' && optLevel !== 'tight' && optLevel !== 'vtight')) return undefined

  const request: CreateXtbOptimizationJobRequest = moleculeRevisionId
    ? { moleculeRevisionId, charge, multiplicity, method, maxSteps, optLevel }
    : {
        structure: projectStructure(structureWire!, atoms),
        charge,
        multiplicity,
        method,
        maxSteps,
        optLevel,
      }
  const name = readNonEmptyString(value, 'name')
  if (name !== undefined) request.name = name
  if ('structure' in request && isMoleculeWire(value.molecule)) {
    request.molecule = value.molecule as unknown as CreateXtbOptimizationJobRequest['molecule']
  }
  return request
}

function projectStructure(value: JsonObject, atoms: XtbAtomInput[]): XtbStructureInput {
  const structure: XtbStructureInput = { atoms }
  const name = readNonEmptyString(value, 'name')
  if (name !== undefined) structure.name = name
  return structure
}

function projectAtom(value: unknown): XtbAtomInput | undefined {
  if (!isObject(value)) return undefined
  const id = readNonEmptyString(value, 'id')
  const symbol = readNonEmptyString(value, 'symbol')
  const x = finiteNumber(value.x)
  const y = finiteNumber(value.y)
  const z = finiteNumber(value.z)
  return id && symbol && x !== undefined && y !== undefined && z !== undefined
    ? { id, symbol, x, y, z }
    : undefined
}

function isMoleculeWire(value: unknown): value is JsonObject {
  if (!isObject(value) || !Array.isArray(value.atoms) || !Array.isArray(value.bonds)) return false
  const atomsAreValid = value.atoms.every(atom => projectAtom(atom) !== undefined)
  const bondsAreValid = value.bonds.every(bond => {
    if (!isObject(bond)) return false
    const order = finiteNumber(bond.order)
    return readNonEmptyString(bond, 'id') !== undefined
      && readNonEmptyString(bond, 'atomId1', 'atom_id_1') !== undefined
      && readNonEmptyString(bond, 'atomId2', 'atom_id_2') !== undefined
      && (order === 1 || order === 2 || order === 3)
  })
  return atomsAreValid && bondsAreValid
}

function projectArtifactRole(value: string | undefined): JobArtifactRole {
  return value === 'input' || value === 'preview' || value === 'output' ? value : 'output'
}

function projectAt<T>(path: string, project: () => T): T {
  try {
    return project()
  } catch (error) {
    if (error instanceof TypeError) throw wireError(path)
    throw error
  }
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function objectValue(value: unknown): JsonObject | undefined {
  return isObject(value) ? value : undefined
}

function hasOwn(value: JsonObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key)
}

function readValue(value: JsonObject | undefined, ...keys: string[]): unknown {
  if (!value) return undefined
  for (const key of keys) {
    if (hasOwn(value, key) && value[key] !== undefined && value[key] !== null) return value[key]
  }
  return undefined
}

function readString(value: JsonObject | undefined, ...keys: string[]): string | undefined {
  const candidate = readValue(value, ...keys)
  return typeof candidate === 'string' ? candidate : undefined
}

function readNonEmptyString(value: JsonObject | undefined, ...keys: string[]): string | undefined {
  const candidate = readString(value, ...keys)?.trim()
  return candidate || undefined
}

function requiredString(value: JsonObject, path: string, ...keys: string[]): string {
  const result = readNonEmptyString(value, ...keys)
  if (result === undefined) throw wireError(path)
  return result
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function readFiniteNonNegativeNumber(value: JsonObject | undefined, ...keys: string[]): number | undefined {
  const candidate = finiteNumber(readValue(value, ...keys))
  return candidate !== undefined && candidate >= 0 ? candidate : undefined
}

function fileExtension(name: string): string | undefined {
  const separator = name.lastIndexOf('.')
  return separator > 0 && separator < name.length - 1 ? name.slice(separator + 1).toLowerCase() : undefined
}

function wireError(path: string): TypeError {
  return new TypeError(`Invalid jobs wire payload at ${path}`)
}
