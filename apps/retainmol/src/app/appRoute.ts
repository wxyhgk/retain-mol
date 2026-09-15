export type AppRoute = 'dashboard' | 'jobs' | 'workflows' | 'editor' | 'templates' | 'lab'

export interface WorkflowEditRouteState {
  readonly workflowId: string
  readonly jobId: string
}

export interface JobEditorRouteState {
  readonly jobId: string
  readonly artifactId: string | null
}

export function resolveAppRoute(pathname: string): AppRoute {
  if (pathname.startsWith('/templates')) return 'templates'
  if (pathname.startsWith('/jobs')) return 'jobs'
  if (pathname.startsWith('/workflows')) return 'workflows'
  if (pathname.startsWith('/lab')) return 'lab'
  return 'dashboard'
}

export function pathForAppRoute(route: Exclude<AppRoute, 'templates'>): string {
  if (route === 'dashboard' || route === 'editor') return '/'
  return `/${route}`
}

export function workflowEditorPath(workflowId: string, jobId: string): string {
  const search = new URLSearchParams({ workflowId, jobId })
  return `/?${search.toString()}`
}

export function workflowPath(workflowId: string): string {
  return `/workflows?${new URLSearchParams({ workflowId }).toString()}`
}

export function jobPath(jobId: string): string {
  return `/jobs/${encodeURIComponent(jobId)}`
}

/** 与 @retainmol/jobs 的 JobStatusBucket 保持同一词汇；路由层不 import feature，自持字面量。 */
const JOBS_BUCKETS = ['all', 'active', 'succeeded', 'attention'] as const
export type JobsBucketParam = (typeof JOBS_BUCKETS)[number]

export function jobsPath(bucket?: JobsBucketParam): string {
  if (!bucket || bucket === 'all') return '/jobs'
  return `/jobs?${new URLSearchParams({ bucket }).toString()}`
}

export function resolveJobsBucket(search: string): JobsBucketParam | null {
  const value = new URLSearchParams(search).get('bucket')?.trim()
  return value && (JOBS_BUCKETS as readonly string[]).includes(value) ? value as JobsBucketParam : null
}

export function resolveJobId(pathname: string): string | null {
  const match = pathname.match(/^\/jobs\/([^/]+)\/?$/)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

export function jobEditorPath(jobId: string, artifactId?: string): string {
  const search = new URLSearchParams({ sourceJobId: jobId })
  if (artifactId) search.set('artifactId', artifactId)
  return `/?${search.toString()}`
}

export function resolveJobEditorRoute(search: string): JobEditorRouteState | null {
  const params = new URLSearchParams(search)
  const jobId = params.get('sourceJobId')?.trim()
  if (!jobId) return null
  return {
    jobId,
    artifactId: params.get('artifactId')?.trim() || null,
  }
}

export function resolveWorkflowEditRoute(search: string): WorkflowEditRouteState | null {
  const params = new URLSearchParams(search)
  const workflowId = params.get('workflowId')?.trim()
  const jobId = params.get('jobId')?.trim()
  return workflowId && jobId ? { workflowId, jobId } : null
}
