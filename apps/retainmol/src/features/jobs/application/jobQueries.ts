import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import type {
  Psi4CreateMutationInput,
  CreateXtbOptimizationJobRequest,
  JobArtifact,
  JobDetail,
  JobSummary,
  JobsApi,
  UpdateJobRequest,
  CloneJobRequest,
} from '../domain/jobTypes'
import { JobsApiClient } from '../infrastructure/jobsApiClient'
import { useJobUiStore } from '../model/jobUiStore'

export const jobsApi = new JobsApiClient()

export const jobQueryKeys = {
  all: ['jobs'] as const,
  list: () => [...jobQueryKeys.all, 'list'] as const,
  detail: (jobId: string) => [...jobQueryKeys.all, 'detail', jobId] as const,
  artifacts: (jobId: string) => [...jobQueryKeys.all, 'artifacts', jobId] as const,
  log: (jobId: string) => [...jobQueryKeys.all, 'log', jobId] as const,
  artifactContent: (jobId: string, artifactId: string) => [...jobQueryKeys.artifacts(jobId), artifactId, 'content'] as const,
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

export function useCreatePsi4JobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Psi4CreateMutationInput) => {
      switch (input.kind) {
        case 'psi4-ts-refine':
          return jobsApi.createPsi4TsRefineJob(input.request)
        case 'psi4-frequency':
          return jobsApi.createPsi4FrequencyJob(input.request)
        case 'psi4-irc':
          return jobsApi.createPsi4IrcJob(input.request)
      }
    },
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

export function useCloneJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, request = {} }: { jobId: string; request?: CloneJobRequest }) =>
      jobsApi.cloneJob(jobId, request),
    onSuccess: job => commitJob(queryClient, job),
  })
}

export function useRetryJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, request = {} }: { jobId: string; request?: CloneJobRequest }) =>
      jobsApi.retryJob(jobId, request),
    onSuccess: job => {
      commitJob(queryClient, job)
      useJobUiStore.getState().selectJob(job.id)
    },
  })
}

export function useCancelJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => jobsApi.cancelJob(jobId),
    onSuccess: job => {
      commitJob(queryClient, job)
      void queryClient.invalidateQueries({ queryKey: jobQueryKeys.log(job.id) })
    },
  })
}

export function useJobLogQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: jobQueryKeys.log(jobId),
    queryFn: ({ signal }) => jobsApi.getJobLog(jobId, 0, { signal }),
    enabled: enabled && Boolean(jobId),
    refetchInterval: query => query.state.data?.complete ? false : 1_000,
  })
}

export function useJobArtifactTextQuery(jobId: string, artifactId: string, enabled = true) {
  return useQuery({
    queryKey: jobQueryKeys.artifactContent(jobId, artifactId),
    queryFn: ({ signal }) => jobsApi.getJobArtifactText(jobId, artifactId, { signal }),
    enabled: enabled && Boolean(jobId && artifactId),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useUpdateJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, request }: { jobId: string; request: UpdateJobRequest }) =>
      jobsApi.updateJob(jobId, request),
    onSuccess: job => commitJob(queryClient, job),
  })
}

export function useDeleteJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => jobsApi.deleteJob(jobId).then(() => jobId),
    onSuccess: jobId => {
      queryClient.setQueryData<JobSummary[]>(jobQueryKeys.list(), jobs =>
        jobs?.filter(job => job.id !== jobId),
      )
      queryClient.removeQueries({ queryKey: jobQueryKeys.detail(jobId) })
      queryClient.removeQueries({ queryKey: jobQueryKeys.artifacts(jobId) })
      if (useJobUiStore.getState().selectedJobId === jobId) {
        useJobUiStore.getState().selectJob(null)
      }
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
