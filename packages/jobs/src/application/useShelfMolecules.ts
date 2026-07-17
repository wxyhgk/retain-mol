import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { moleculeRevisionOptions } from '@retainmol/molecule-assets'
import type { JobDetail, JobSummary } from '../domain/jobTypes'
import {
  deriveShelfEntry,
  resolveShelfMoleculeSource,
  type ShelfMoleculeEntry,
} from '../domain/shelf/jobMolecule'
import { jobDetailOptions } from './jobQueries'

/**
 * 展柜的分子扇出：per job 详情 + 去重后的 revision 查询。
 * 展开既有 options 保证 queryKey/queryFn 与详情页一致 → 缓存共享；
 * refetchInterval 覆写为 false 只作用于本观察者，列表 2s 轮询照常驱动状态。
 */
export function useShelfMolecules(jobs: readonly JobSummary[]): Map<string, ShelfMoleculeEntry> {
  const details = useQueries({
    queries: jobs.map(job => ({
      ...jobDetailOptions(job.id),
      refetchInterval: false as const,
      staleTime: 30_000,
    })),
    combine: results => results.map(result => ({
      data: result.data as JobDetail | undefined,
      isPending: result.isPending,
    })),
  })

  const revisionIds = useMemo(() => {
    const ids = new Set<string>()
    for (const { data } of details) {
      if (!data) continue
      const source = resolveShelfMoleculeSource(data)
      if (source.kind === 'revision') ids.add(source.revisionId)
    }
    return [...ids]
  }, [details])

  const revisions = useQueries({
    queries: revisionIds.map(id => ({
      ...moleculeRevisionOptions(id),
      staleTime: Infinity,
    })),
    combine: results => results.map(result => ({
      data: result.data,
      isPending: result.isPending,
    })),
  })

  return useMemo(() => {
    const revisionById = new Map(revisionIds.map((id, index) => [id, revisions.at(index)]))
    const entries = new Map<string, ShelfMoleculeEntry>()
    jobs.forEach((job, index) => {
      const detail = details.at(index)
      let revision
      let revisionPending = false
      if (detail?.data) {
        const source = resolveShelfMoleculeSource(detail.data)
        if (source.kind === 'revision') {
          const result = revisionById.get(source.revisionId)
          revision = result?.data
          revisionPending = result?.isPending ?? true
        }
      }
      entries.set(job.id, deriveShelfEntry(detail?.data, detail?.isPending ?? true, revision, revisionPending))
    })
    return entries
  }, [jobs, details, revisions, revisionIds])
}
