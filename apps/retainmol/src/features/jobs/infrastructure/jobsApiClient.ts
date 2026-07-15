import type {
  CreateXtbOptimizationJobRequest,
  JobArtifact,
  JobDetail,
  JobSummary,
  JobsApi,
} from '../domain/jobTypes'
import {
  projectJobArtifactListWire,
  projectJobArtifactWire,
  projectJobListWire,
  projectJobWire,
} from './jobWireProjector'

interface BrowserLocation {
  protocol: string
  hostname: string
}

export function resolveJobsApiBase(
  configuredUrl: string | undefined = import.meta.env.VITE_RETAINMOL_BACKEND_URL,
  browserLocation: BrowserLocation | undefined = typeof window === 'undefined'
    ? undefined
    : window.location,
): string {
  const configured = configuredUrl?.trim()
  if (configured) return configured.replace(/\/$/, '')
  if (browserLocation?.hostname) return `${browserLocation.protocol}//${browserLocation.hostname}:8000`
  return 'http://127.0.0.1:8000'
}

export function resolveJobArtifactUrl(artifact: Pick<JobArtifact, 'downloadUrl'>, baseUrl = resolveJobsApiBase()) {
  if (!artifact.downloadUrl) return null
  if (/^https?:\/\//.test(artifact.downloadUrl)) return artifact.downloadUrl
  return `${baseUrl}${artifact.downloadUrl.startsWith('/') ? '' : '/'}${artifact.downloadUrl}`
}

export class JobsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'JobsApiError'
  }
}

async function responseError(response: Response): Promise<JobsApiError> {
  let detail = `HTTP ${response.status}`
  const fieldErrors: Record<string, string> = {}
  try {
    const payload = await response.json() as {
      detail?: string | Array<{ loc?: Array<string | number>; msg?: string }>
      message?: string
    }
    if (Array.isArray(payload.detail)) {
      for (const issue of payload.detail) {
        const field = issue.loc?.filter(part => part !== 'body').join('.')
        if (field && issue.msg) fieldErrors[field] = issue.msg
      }
      detail = payload.detail.map(issue => issue.msg).filter(Boolean).join('; ') || detail
    } else {
      detail = payload.detail ?? payload.message ?? detail
    }
  } catch {
    // A plain-text error body still has a useful HTTP status.
  }
  return new JobsApiError(`Jobs API request failed: ${detail}`, response.status, fieldErrors)
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw await responseError(response)
  return response.json() as Promise<T>
}

function encodeSegment(value: string) {
  return encodeURIComponent(value)
}

export class JobsApiClient implements JobsApi {
  constructor(private readonly baseUrl = resolveJobsApiBase()) {}

  async listJobs(options: { signal?: AbortSignal } = {}): Promise<JobSummary[]> {
    return projectJobListWire(await this.get<unknown>('/jobs', options))
  }

  createXtbOptimizationJob(
    request: CreateXtbOptimizationJobRequest,
    options: { signal?: AbortSignal } = {},
  ): Promise<JobDetail> {
    return this.post('/jobs/xtb/optimize', request, options).then(projectJobWire)
  }

  async getJob(jobId: string, options: { signal?: AbortSignal } = {}): Promise<JobDetail> {
    return this.get(`/jobs/${encodeSegment(jobId)}`, options).then(projectJobWire)
  }

  runJob(jobId: string, options: { signal?: AbortSignal } = {}): Promise<JobDetail> {
    return this.post(`/jobs/${encodeSegment(jobId)}/run`, undefined, options).then(projectJobWire)
  }

  async listJobArtifacts(jobId: string, options: { signal?: AbortSignal } = {}): Promise<JobArtifact[]> {
    const payload = await this.get<unknown>(
      `/jobs/${encodeSegment(jobId)}/artifacts`,
      options,
    )
    return projectJobArtifactListWire(payload)
  }

  uploadJobThumbnail(jobId: string, dataUrl: string, options: { signal?: AbortSignal } = {}): Promise<JobArtifact> {
    return this.post(`/jobs/${encodeSegment(jobId)}/thumbnail`, { dataUrl }, options)
      .then(projectJobArtifactWire)
  }

  private async get<T>(path: string, options: { signal?: AbortSignal }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { signal: options.signal })
    return readJson<T>(response)
  }

  private async post<T>(path: string, body: unknown, options: { signal?: AbortSignal }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options.signal,
    })
    return readJson<T>(response)
  }
}
