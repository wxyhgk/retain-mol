import { resolveJobArtifactUrl, type JobArtifact } from '@/features/jobs'
import { parseOptimizationTrajectory } from '../domain/optimizationTrajectory'

export async function fetchOptimizationTrajectory(
  artifact: JobArtifact,
  options: { signal?: AbortSignal } = {},
) {
  const url = resolveJobArtifactUrl(artifact)
  if (!url) throw new Error('轨迹 Artifact 没有可读取的地址')
  const response = await fetch(url, { signal: options.signal })
  if (!response.ok) throw new Error(`读取优化轨迹失败：HTTP ${response.status}`)
  return parseOptimizationTrajectory(await response.json())
}
