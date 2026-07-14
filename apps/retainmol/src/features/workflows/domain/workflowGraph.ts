import type { WorkflowReferenceDraft } from './workflowTypes'

export interface WorkflowGraphValidation {
  ok: boolean
  order: string[]
  error?: string
}

export function validateWorkflowGraph(
  jobIds: string[],
  references: WorkflowReferenceDraft[],
): WorkflowGraphValidation {
  const jobs = [...new Set(jobIds)]
  if (jobs.length === 0) return { ok: false, order: [], error: 'Add at least one job.' }
  if (jobs.length !== jobIds.length) return { ok: false, order: [], error: 'A job can appear only once.' }

  const jobSet = new Set(jobs)
  const incoming = new Map(jobs.map(jobId => [jobId, 0]))
  const outgoing = new Map(jobs.map(jobId => [jobId, new Set<string>()]))
  const targets = new Set<string>()
  for (const reference of references) {
    if (!jobSet.has(reference.sourceJobId) || !jobSet.has(reference.targetJobId)) {
      return { ok: false, order: [], error: 'Every reference must connect jobs in this workflow.' }
    }
    if (reference.sourceJobId === reference.targetJobId) {
      return { ok: false, order: [], error: 'A job cannot reference itself.' }
    }
    const target = `${reference.targetJobId}\u0000${reference.targetInputName}`
    if (targets.has(target)) return { ok: false, order: [], error: 'Each target input can have only one source.' }
    targets.add(target)
    const sourceTargets = outgoing.get(reference.sourceJobId)!
    if (!sourceTargets.has(reference.targetJobId)) {
      sourceTargets.add(reference.targetJobId)
      incoming.set(reference.targetJobId, incoming.get(reference.targetJobId)! + 1)
    }
  }

  const ready = jobs.filter(jobId => incoming.get(jobId) === 0)
  const order: string[] = []
  while (ready.length) {
    const jobId = ready.shift()!
    order.push(jobId)
    for (const target of [...outgoing.get(jobId)!].sort()) {
      const next = incoming.get(target)! - 1
      incoming.set(target, next)
      if (next === 0) ready.push(target)
    }
  }
  return order.length === jobs.length
    ? { ok: true, order }
    : { ok: false, order: [], error: 'References form a cycle.' }
}
