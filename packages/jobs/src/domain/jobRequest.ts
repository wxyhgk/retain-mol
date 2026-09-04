import type { CreatePsi4JobRequest, CreateXtbOptimizationJobRequest, JobDetail } from './jobTypes'

export function isXtbRequest(
  request: JobDetail['request'],
): request is CreateXtbOptimizationJobRequest {
  return request?.method === 'gfn2' && 'optLevel' in request
}

export function isPsi4Request(request: JobDetail['request']): request is CreatePsi4JobRequest {
  return Boolean(request && 'basis' in request)
}

export function revisionIdFor(job: JobDetail): string | null {
  const request = job.request
  if (!request || !('moleculeRevisionId' in request)) return null
  return typeof request.moleculeRevisionId === 'string' ? request.moleculeRevisionId : null
}

export function literalAtomCount(job: JobDetail): string | null {
  const request = job.request
  if (!request || !('structure' in request) || !request.structure) return null
  return String(request.structure.atoms.length)
}
