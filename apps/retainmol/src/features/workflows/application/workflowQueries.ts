import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { WorkflowSaveRequest } from '../domain/workflowTypes'
import { WorkflowsApiClient } from '../infrastructure/workflowsApiClient'

const api = new WorkflowsApiClient()

export const workflowQueryKeys = {
  all: ['workflows'] as const,
  list: () => [...workflowQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...workflowQueryKeys.all, 'detail', id] as const,
}

export function useWorkflowsQuery() {
  return useQuery({ queryKey: workflowQueryKeys.list(), queryFn: ({ signal }) => api.listWorkflows({ signal }) })
}

export function useSaveWorkflowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workflowId, request }: { workflowId: string | null; request: WorkflowSaveRequest }) =>
      workflowId ? api.updateWorkflow(workflowId, request) : api.createWorkflow(request),
    onSuccess: workflow => {
      queryClient.setQueryData(workflowQueryKeys.detail(workflow.workflowId), workflow)
      void queryClient.invalidateQueries({ queryKey: workflowQueryKeys.list() })
    },
  })
}
