import { describe, expect, it } from 'vitest'
import {
  jobEditorPath,
  jobPath,
  jobsPath,
  pathForAppRoute,
  resolveJobsBucket,
  resolveAppRoute,
  resolveJobEditorRoute,
  resolveJobId,
  resolveWorkflowEditRoute,
  workflowEditorPath,
  workflowPath,
} from './appRoute'

describe('appRoute', () => {
  it.each([
    ['/', 'dashboard'],
    ['/unknown', 'dashboard'],
    ['/jobs', 'jobs'],
    ['/jobs/20260715-test', 'jobs'],
    ['/workflows', 'workflows'],
    ['/editor', 'dashboard'],
    ['/templates/new', 'templates'],
    ['/lab', 'lab'],
  ])('resolves %s as %s', (pathname, route) => {
    expect(resolveAppRoute(pathname)).toBe(route)
  })

  it('builds stable top-level paths', () => {
    expect(pathForAppRoute('dashboard')).toBe('/')
    expect(pathForAppRoute('jobs')).toBe('/jobs')
    expect(pathForAppRoute('workflows')).toBe('/workflows')
    expect(pathForAppRoute('editor')).toBe('/')
  })

  it('round-trips workflow editor context through the URL', () => {
    expect(workflowEditorPath('workflow 1', 'job/2')).toBe('/?workflowId=workflow+1&jobId=job%2F2')
    expect(resolveWorkflowEditRoute('?workflowId=workflow+1&jobId=job%2F2')).toEqual({
      workflowId: 'workflow 1',
      jobId: 'job/2',
    })
    expect(workflowPath('workflow 1')).toBe('/workflows?workflowId=workflow+1')
  })

  it('rejects partial workflow editor context', () => {
    expect(resolveWorkflowEditRoute('?workflowId=workflow-1')).toBeNull()
  })

  it('round-trips job detail and editor routes', () => {
    expect(jobPath('job/one')).toBe('/jobs/job%2Fone')
    expect(resolveJobId('/jobs/job%2Fone')).toBe('job/one')
    expect(resolveJobId('/jobs')).toBeNull()
    expect(resolveJobId('/jobs/%E0%A4%A')).toBeNull()

    expect(jobEditorPath('job/one', 'artifact two')).toBe(
      '/?sourceJobId=job%2Fone&artifactId=artifact+two',
    )
    expect(resolveJobEditorRoute('?sourceJobId=job%2Fone&artifactId=artifact+two')).toEqual({
      jobId: 'job/one',
      artifactId: 'artifact two',
    })
    expect(resolveJobEditorRoute('?artifactId=artifact-1')).toBeNull()
  })

  it('round-trips the jobs status bucket, treating all as the bare path', () => {
    expect(jobsPath()).toBe('/jobs')
    expect(jobsPath('all')).toBe('/jobs')
    expect(jobsPath('active')).toBe('/jobs?bucket=active')
    expect(resolveJobsBucket('?bucket=active')).toBe('active')
    expect(resolveJobsBucket('?bucket=bogus')).toBeNull()
    expect(resolveJobsBucket('')).toBeNull()
  })
})
