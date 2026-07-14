export type WorkflowReferenceSourceKind = 'input' | 'artifact'

export interface WorkflowJobOption {
  id: string
  name: string
  status?: string
}

export interface WorkflowReferenceDraft {
  targetJobId: string
  targetInputName: string
  sourceJobId: string
  sourceKind: WorkflowReferenceSourceKind
  sourceName: string
}

export interface WorkflowInputReference extends WorkflowReferenceDraft {
  referenceId: string
  workflowId: string
  createdAt: string
}

export interface WorkflowDefinition {
  workflowId: string
  name: string
  createdAt: string
  updatedAt: string
  jobIds: string[]
  references: WorkflowInputReference[]
}

export interface WorkflowSaveRequest {
  name: string
  jobIds: string[]
  references: WorkflowReferenceDraft[]
}

export interface WorkflowsApi {
  listWorkflows(options?: { signal?: AbortSignal }): Promise<WorkflowDefinition[]>
  getWorkflow(workflowId: string, options?: { signal?: AbortSignal }): Promise<WorkflowDefinition>
  createWorkflow(request: WorkflowSaveRequest, options?: { signal?: AbortSignal }): Promise<WorkflowDefinition>
  updateWorkflow(workflowId: string, request: WorkflowSaveRequest, options?: { signal?: AbortSignal }): Promise<WorkflowDefinition>
}
