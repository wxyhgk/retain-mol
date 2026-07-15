import type {
  WorkflowDefinition,
  WorkflowInputReference,
  WorkflowReferenceSourceKind,
} from '../domain/workflowTypes'

type JsonObject = Record<string, unknown>

export function isWorkflowWire(value: unknown): value is JsonObject {
  if (!isObject(value)) return false
  return readNonEmptyString(value, 'workflowId', 'workflow_id', 'id') !== undefined
    && readNonEmptyString(value, 'name') !== undefined
    && readNonEmptyString(value, 'createdAt', 'created_at') !== undefined
    && readNonEmptyString(value, 'updatedAt', 'updated_at') !== undefined
    && Array.isArray(readValue(value, 'jobIds', 'job_ids'))
    && (!hasOwn(value, 'references') || Array.isArray(value.references))
}

export function isWorkflowReferenceWire(value: unknown): value is JsonObject {
  if (!isObject(value)) return false
  const sourceKind = readNonEmptyString(value, 'sourceKind', 'source_kind')
  return readNonEmptyString(value, 'referenceId', 'reference_id', 'id') !== undefined
    && readNonEmptyString(value, 'workflowId', 'workflow_id') !== undefined
    && readNonEmptyString(value, 'targetJobId', 'target_job_id') !== undefined
    && readNonEmptyString(value, 'targetInputName', 'target_input_name') !== undefined
    && readNonEmptyString(value, 'sourceJobId', 'source_job_id') !== undefined
    && (sourceKind === 'input' || sourceKind === 'artifact')
    && readNonEmptyString(value, 'sourceName', 'source_name') !== undefined
    && readNonEmptyString(value, 'createdAt', 'created_at') !== undefined
}

export function projectWorkflowWire(value: unknown): WorkflowDefinition {
  if (!isWorkflowWire(value)) throw wireError('workflow')
  const jobIdsWire = readValue(value, 'jobIds', 'job_ids') as unknown[]
  const jobIds = jobIdsWire.map((jobId, index) => {
    if (typeof jobId !== 'string' || !jobId.trim()) throw wireError(`workflow.jobIds[${index}]`)
    return jobId.trim()
  })
  const referencesWire = Array.isArray(value.references) ? value.references : []
  const references = referencesWire.map((reference, index) => projectWorkflowReferenceWire(
    reference,
    `workflow.references[${index}]`,
  ))

  return {
    workflowId: requiredString(value, 'workflow.workflowId', 'workflowId', 'workflow_id', 'id'),
    name: requiredString(value, 'workflow.name', 'name'),
    createdAt: requiredString(value, 'workflow.createdAt', 'createdAt', 'created_at'),
    updatedAt: requiredString(value, 'workflow.updatedAt', 'updatedAt', 'updated_at'),
    jobIds,
    references,
  }
}

export function projectWorkflowListWire(value: unknown): WorkflowDefinition[] {
  const workflows = Array.isArray(value) ? value : isObject(value) ? value.workflows : undefined
  if (!Array.isArray(workflows)) throw wireError('workflows collection')
  return workflows.map((workflow, index) => {
    try {
      return projectWorkflowWire(workflow)
    } catch (error) {
      if (error instanceof TypeError) throw wireError(`workflows[${index}]`)
      throw error
    }
  })
}

export function projectWorkflowReferenceWire(
  value: unknown,
  path = 'workflow reference',
): WorkflowInputReference {
  if (!isWorkflowReferenceWire(value)) throw wireError(path)
  const projected: WorkflowInputReference = {
    referenceId: requiredString(value, `${path}.referenceId`, 'referenceId', 'reference_id', 'id'),
    workflowId: requiredString(value, `${path}.workflowId`, 'workflowId', 'workflow_id'),
    targetJobId: requiredString(value, `${path}.targetJobId`, 'targetJobId', 'target_job_id'),
    targetInputName: requiredString(value, `${path}.targetInputName`, 'targetInputName', 'target_input_name'),
    sourceJobId: requiredString(value, `${path}.sourceJobId`, 'sourceJobId', 'source_job_id'),
    sourceKind: requiredString(value, `${path}.sourceKind`, 'sourceKind', 'source_kind') as WorkflowReferenceSourceKind,
    sourceName: requiredString(value, `${path}.sourceName`, 'sourceName', 'source_name'),
    createdAt: requiredString(value, `${path}.createdAt`, 'createdAt', 'created_at'),
  }
  const sourceArtifactId = readNonEmptyString(value, 'sourceArtifactId', 'source_artifact_id')
  if (sourceArtifactId !== undefined) projected.sourceArtifactId = sourceArtifactId
  return projected
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function readNonEmptyString(value: JsonObject | undefined, ...keys: string[]): string | undefined {
  const candidate = readValue(value, ...keys)
  if (typeof candidate !== 'string') return undefined
  return candidate.trim() || undefined
}

function requiredString(value: JsonObject, path: string, ...keys: string[]): string {
  const result = readNonEmptyString(value, ...keys)
  if (result === undefined) throw wireError(path)
  return result
}

function wireError(path: string): TypeError {
  return new TypeError(`Invalid workflows wire payload at ${path}`)
}
