import { describe, expect, it } from 'vitest'
import { moleculeRevisionOptions } from '@retainmol/molecule-assets'
import { jobDetailOptions, jobQueryKeys } from './jobQueries'

// 展柜扇出必须与详情页共享缓存：key 由既有 options 派生，这里锁死契约。
describe('useShelfMolecules query contract', () => {
  it('reuses the canonical job detail query key', () => {
    expect(jobDetailOptions('job-1').queryKey).toEqual(jobQueryKeys.detail('job-1'))
  })

  it('reuses the canonical molecule revision query key', () => {
    const options = moleculeRevisionOptions('rev-1')
    expect(options.queryKey).toContain('rev-1')
    expect(options.enabled).toBe(true)
  })
})
