import type { CreateTsPreparationWorkflowRequest, WorkflowsApi, WorkflowSaveRequest } from '../domain/workflowTypes'
import { projectTsPreparationWorkflowWire, projectWorkflowListWire, projectWorkflowWire } from './workflowWireProjector'
import { resolveBackendUrl } from '@/infrastructure/backendUrl'

interface BrowserLocation {
  protocol: string
  hostname: string
}

export function resolveWorkflowsApiBase(
  configuredUrl: string | undefined = undefined,
  browserLocation: BrowserLocation | undefined = typeof window === 'undefined' ? undefined : window.location,
): string {
  return resolveBackendUrl(configuredUrl, browserLocation)
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>
  let detail = `HTTP ${response.status}`
  try {
    const payload = await response.json() as { detail?: string }
    detail = payload.detail ?? detail
  } catch {
    // HTTP status is still actionable when the backend emits no JSON error body.
  }
  throw new Error(`Workflows API request failed: ${detail}`)
}

export class WorkflowsApiClient implements WorkflowsApi {
  constructor(private readonly baseUrl = resolveWorkflowsApiBase()) {}

  listWorkflows(options: { signal?: AbortSignal } = {}) {
    return this.request<unknown>('/jobs/workflows', { signal: options.signal }).then(projectWorkflowListWire)
  }

  getWorkflow(workflowId: string, options: { signal?: AbortSignal } = {}) {
    return this.request<unknown>(`/jobs/workflows/${encodeURIComponent(workflowId)}`, { signal: options.signal }).then(projectWorkflowWire)
  }

  createWorkflow(request: WorkflowSaveRequest, options: { signal?: AbortSignal } = {}) {
    return this.request<unknown>('/jobs/workflows', { method: 'POST', body: request, signal: options.signal }).then(projectWorkflowWire)
  }

  createTsPreparationWorkflow(request: CreateTsPreparationWorkflowRequest, options: { signal?: AbortSignal } = {}) {
    return this.request<unknown>('/jobs/workflows/ts-preparation', {
      method: 'POST', body: request, signal: options.signal,
    }).then(projectTsPreparationWorkflowWire)
  }

  updateWorkflow(workflowId: string, request: WorkflowSaveRequest, options: { signal?: AbortSignal } = {}) {
    return this.request<unknown>(`/jobs/workflows/${encodeURIComponent(workflowId)}`, { method: 'PUT', body: request, signal: options.signal }).then(projectWorkflowWire)
  }

  private async request<T>(path: string, options: { method?: 'POST' | 'PUT'; body?: unknown; signal?: AbortSignal }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers: options.body ? { 'content-type': 'application/json' } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
    return readJson<T>(response)
  }
}
