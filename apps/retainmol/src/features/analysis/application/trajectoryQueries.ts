import { queryOptions, useQuery } from '@tanstack/react-query'
import type { JobArtifact } from '@/features/jobs'
import { fetchOptimizationTrajectory } from '../infrastructure/analysisApiClient'

export const analysisQueryKeys = {
  all: ['analysis'] as const,
  trajectory: (jobId: string, artifactId: string) =>
    [...analysisQueryKeys.all, 'trajectory', jobId, artifactId] as const,
}

export function trajectoryOptions(artifact: JobArtifact | null) {
  return queryOptions({
    queryKey: analysisQueryKeys.trajectory(artifact?.jobId ?? '', artifact?.id ?? ''),
    queryFn: ({ signal }) => fetchOptimizationTrajectory(artifact!, { signal }),
    enabled: Boolean(artifact),
    staleTime: Infinity,
  })
}

export function useOptimizationTrajectoryQuery(artifact: JobArtifact | null) {
  return useQuery(trajectoryOptions(artifact))
}
