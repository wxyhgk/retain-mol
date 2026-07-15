import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import type {
  CreateXtbOptimizationJobRequest,
  JobArtifact,
  JobDetail,
  JobSummary,
  JobsApi,
} from '../domain/jobTypes'
import { JobsApiClient } from '../infrastructure/jobsApiClient'
import { useJobUiStore } from '../model/jobUiStore'

export const jobsApi = new JobsApiClient()

export const jobQueryKeys = {
  all: ['jobs'] as const,
  list: () => [...jobQueryKeys.all, 'list'] as const,
  detail: (jobId: string) => [...jobQueryKeys.all, 'detail', jobId] as const,
  artifacts: (jobId: string) => [...jobQueryKeys.all, 'artifacts', jobId] as const,
}

export function isTerminalJobStatus(status: string | undefined) {
  return status === 'succeeded' || status === 'failed' || status === 'cancelled' || status === 'interrupted'
}

export function jobsListOptions(api: JobsApi = jobsApi) {
  return queryOptions({
    queryKey: jobQueryKeys.list(),
    queryFn: ({ signal }) => api.listJobs({ signal }),
    refetchInterval: query => query.state.data?.some(job => !isTerminalJobStatus(job.status)) ? 2_000 : false,
  })
}

export function jobDetailOptions(jobId: string, api: JobsApi = jobsApi) {
  return queryOptions({
    queryKey: jobQueryKeys.detail(jobId),
    queryFn: async ({ signal }) => {
      const [job, artifacts] = await Promise.all([
        api.getJob(jobId, { signal }),
        api.listJobArtifacts(jobId, { signal }),
      ])
      return { ...job, artifacts }
    },
    enabled: Boolean(jobId),
    refetchInterval: query => isTerminalJobStatus(query.state.data?.status) ? false : 2_000,
  })
}

function mergeJob(jobs: JobSummary[] | undefined, job: JobSummary) {
  const next = jobs ?? []
  return next.some(item => item.id === job.id)
    ? next.map(item => item.id === job.id ? { ...item, ...job } : item)
    : [job, ...next]
}

function commitJob(queryClient: QueryClient, job: JobDetail) {
  queryClient.setQueryData<JobSummary[]>(jobQueryKeys.list(), jobs => mergeJob(jobs, job))
  queryClient.setQueryData<JobDetail>(jobQueryKeys.detail(job.id), current => ({
    ...job,
    artifacts: job.artifacts ?? current?.artifacts ?? [],
  }))
}

export function useJobsQuery() {
  return useQuery(jobsListOptions())
}

export function useJobDetailQuery(jobId: string | null) {
  return useQuery(jobDetailOptions(jobId ?? ''))
}

export function useCreateXtbJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateXtbOptimizationJobRequest) => jobsApi.createXtbOptimizationJob(request),
    onSuccess: job => {
      commitJob(queryClient, job)
      useJobUiStore.getState().selectJob(job.id)
    },
  })
}

export function useRunJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => jobsApi.runJob(jobId),
    onSuccess: job => {
      commitJob(queryClient, job)
      void queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(job.id) })
      void queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() })
    },
  })
}

export function useUploadJobThumbnailMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, dataUrl }: { jobId: string; dataUrl: string }) =>
      jobsApi.uploadJobThumbnail(jobId, dataUrl),
    onSuccess: (artifact, variables) => {
      const replacePreview = (artifacts: JobArtifact[] | undefined) => [
        ...(artifacts ?? []).filter(item => item.role !== 'preview'),
        artifact,
      ]
      queryClient.setQueryData<JobSummary[]>(jobQueryKeys.list(), jobs =>
        jobs?.map(job => job.id === variables.jobId
          ? { ...job, artifacts: replacePreview(job.artifacts) }
          : job),
      )
      queryClient.setQueryData<JobDetail>(jobQueryKeys.detail(variables.jobId), job =>
        job ? { ...job, artifacts: replacePreview(job.artifacts) } : job,
      )
    },
  })
}
