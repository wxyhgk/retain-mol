export type AppRoute = 'dashboard' | 'jobs' | 'workflows' | 'editor' | 'templates'

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
  if (pathname.startsWith('/editor')) return 'editor'
  if (pathname.startsWith('/jobs')) return 'jobs'
  if (pathname.startsWith('/workflows')) return 'workflows'
  return 'dashboard'
}

export function pathForAppRoute(route: Exclude<AppRoute, 'templates'>): string {
  if (route === 'dashboard') return '/'
  return `/${route}`
}

export function workflowEditorPath(workflowId: string, jobId: string): string {
  const search = new URLSearchParams({ workflowId, jobId })
  return `/editor?${search.toString()}`
}

export function workflowPath(workflowId: string): string {
  return `/workflows?${new URLSearchParams({ workflowId }).toString()}`
}

export function jobPath(jobId: string): string {
  return `/jobs/${encodeURIComponent(jobId)}`
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
  return `/editor?${search.toString()}`
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
