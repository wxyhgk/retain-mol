import { describe, expect, it } from 'vitest'
import type { JobStatus, JobSummary } from './jobTypes'
import { countJobsByBucket, filterJobs, matchesStatusBucket } from './jobFilter'

function job(id: string, status: JobStatus, overrides: Partial<JobSummary> = {}): JobSummary {
  return { id, kind: 'xtb-optimization', status, name: `任务 ${id}`, createdAt: '2026-07-16T08:00:00Z', ...overrides }
}

describe('jobFilter', () => {
  it('maps all seven statuses onto the four buckets', () => {
    const expectations: Array<[JobStatus, boolean, boolean, boolean]> = [
      // status, active, succeeded, attention
      ['created', false, false, false],
      ['queued', true, false, false],
      ['running', true, false, false],
      ['succeeded', false, true, false],
      ['failed', false, false, true],
      ['cancelled', false, false, false],
      ['interrupted', false, false, true],
    ]
    for (const [status, active, succeeded, attention] of expectations) {
      expect(matchesStatusBucket(status, 'all')).toBe(true)
      expect(matchesStatusBucket(status, 'active')).toBe(active)
      expect(matchesStatusBucket(status, 'succeeded')).toBe(succeeded)
      expect(matchesStatusBucket(status, 'attention')).toBe(attention)
    }
  })

  it('filters by name, id, or localized calculation label', () => {
    const jobs = [
      job('abc-123', 'queued', { name: '乙烯优化' }),
      job('def-456', 'succeeded', { name: 'benzene', kind: 'psi4-frequency' }),
    ]
    expect(filterJobs(jobs, { query: '乙烯', bucket: 'all' }).map(item => item.id)).toEqual(['abc-123'])
    expect(filterJobs(jobs, { query: 'DEF-4', bucket: 'all' }).map(item => item.id)).toEqual(['def-456'])
    expect(filterJobs(jobs, { query: '频率', bucket: 'all' }).map(item => item.id)).toEqual(['def-456'])
    expect(filterJobs(jobs, { query: '', bucket: 'all' })).toHaveLength(2)
    expect(filterJobs(jobs, { query: '乙烯', bucket: 'succeeded' })).toHaveLength(0)
  })

  it('counts jobs per bucket with all as the total', () => {
    const jobs = [
      job('1', 'queued'),
      job('2', 'running'),
      job('3', 'succeeded'),
      job('4', 'failed'),
      job('5', 'cancelled'),
      job('6', 'created'),
    ]
    expect(countJobsByBucket(jobs)).toEqual({ all: 6, active: 2, succeeded: 1, attention: 1 })
  })
})
