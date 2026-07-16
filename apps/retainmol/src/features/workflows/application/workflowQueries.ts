import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTsPreparationWorkflowRequest, WorkflowSaveRequest } from '../domain/workflowTypes'
import { WorkflowsApiClient } from '../infrastructure/workflowsApiClient'

export const workflowsApi = new WorkflowsApiClient()

export const workflowQueryKeys = {
  all: ['workflows'] as const,
  list: () => [...workflowQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...workflowQueryKeys.all, 'detail', id] as const,
}

export function useWorkflowsQuery() {
  return useQuery({ queryKey: workflowQueryKeys.list(), queryFn: ({ signal }) => workflowsApi.listWorkflows({ signal }) })
}

export function useSaveWorkflowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workflowId, request }: { workflowId: string | null; request: WorkflowSaveRequest }) =>
      workflowId ? workflowsApi.updateWorkflow(workflowId, request) : workflowsApi.createWorkflow(request),
    onSuccess: workflow => {
      queryClient.setQueryData(workflowQueryKeys.detail(workflow.workflowId), workflow)
      void queryClient.invalidateQueries({ queryKey: workflowQueryKeys.list() })
    },
  })
}

export function useCreateTsPreparationWorkflowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateTsPreparationWorkflowRequest) =>
      workflowsApi.createTsPreparationWorkflow(request),
    onSuccess: workflow => {
      queryClient.setQueryData(workflowQueryKeys.detail(workflow.workflowId), workflow)
      void queryClient.invalidateQueries({ queryKey: workflowQueryKeys.list() })
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
