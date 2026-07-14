import type { WorkflowDefinition, WorkflowsApi, WorkflowSaveRequest } from '../domain/workflowTypes'

interface BrowserLocation {
  protocol: string
  hostname: string
}

export function resolveWorkflowsApiBase(
  configuredUrl: string | undefined = import.meta.env.VITE_RETAINMOL_BACKEND_URL,
  browserLocation: BrowserLocation | undefined = typeof window === 'undefined' ? undefined : window.location,
): string {
  const configured = configuredUrl?.trim()
  if (configured) return configured.replace(/\/$/, '')
  if (browserLocation?.hostname) return `${browserLocation.protocol}//${browserLocation.hostname}:8000`
  return 'http://127.0.0.1:8000'
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
    return this.request<WorkflowDefinition[]>('/jobs/workflows', { signal: options.signal })
  }

  getWorkflow(workflowId: string, options: { signal?: AbortSignal } = {}) {
    return this.request<WorkflowDefinition>(`/jobs/workflows/${encodeURIComponent(workflowId)}`, { signal: options.signal })
  }

  createWorkflow(request: WorkflowSaveRequest, options: { signal?: AbortSignal } = {}) {
    return this.request<WorkflowDefinition>('/jobs/workflows', { method: 'POST', body: request, signal: options.signal })
  }

  updateWorkflow(workflowId: string, request: WorkflowSaveRequest, options: { signal?: AbortSignal } = {}) {
    return this.request<WorkflowDefinition>(`/jobs/workflows/${encodeURIComponent(workflowId)}`, { method: 'PUT', body: request, signal: options.signal })
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
