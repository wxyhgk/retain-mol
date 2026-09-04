import { describe, expect, it } from 'vitest'
import type { JobDetail } from './jobTypes'
import { calculationLabel, formatArtifactSize, formatJobDuration, jobParameterRows, jobStatusLabel, shortIdentifier } from './jobPresentation'

describe('jobPresentation', () => {
  it('presents every supported calculation kind without leaking wire identifiers', () => {
    expect(calculationLabel('xtb-optimization')).toBe('xTB 几何优化')
    expect(calculationLabel('psi4-frequency')).toBe('Psi4 频率分析')
    expect(calculationLabel('psi4-ts-refine')).toBe('Psi4 过渡态精修')
    expect(calculationLabel('psi4-irc')).toBe('Psi4 IRC')
    expect(calculationLabel('future-engine')).toBe('future-engine')
  })

  it('formats durable job statuses and artifact sizes', () => {
    expect(jobStatusLabel('queued')).toBe('等待中')
    expect(jobStatusLabel('succeeded')).toBe('已完成')
    expect(formatArtifactSize(undefined)).toBe('—')
    expect(formatArtifactSize(512)).toBe('512 B')
    expect(formatArtifactSize(2048)).toBe('2.0 KB')
  })

  it('shortens long identifiers but keeps short ones intact', () => {
    expect(shortIdentifier('rev-12345')).toBe('rev-12345')
    expect(shortIdentifier('a'.repeat(20))).toBe('a'.repeat(20))
    expect(shortIdentifier('abcdefghijklmnopqrstu')).toBe('abcdefghijkl…pqrstu')
  })

  it('renders xtb parameter rows with the literal atom count', () => {
    const job: JobDetail = {
      id: 'j1', kind: 'xtb-optimization', status: 'queued', name: 'opt', createdAt: '2026-07-16T08:00:00Z',
      request: {
        charge: 0, multiplicity: 1, method: 'gfn2', maxSteps: 200, optLevel: 'tight',
        structure: { atoms: [{ id: 'a', symbol: 'C', x: 0, y: 0, z: 0 }] },
      },
    }
    expect(jobParameterRows(job)).toEqual([
      ['任务类型', 'xTB 几何优化'],
      ['原子', '1'],
      ['电荷', '0'],
      ['多重度', '1'],
      ['方法', 'GFN2-xTB'],
      ['优化级别', 'tight'],
      ['最大步数', '200'],
    ])
  })

  it('renders psi4 rows per kind, with threads/memory only in the full variant', () => {
    const tsRefine: JobDetail = {
      id: 'j2', kind: 'psi4-ts-refine', status: 'queued', name: 'ts', createdAt: '2026-07-16T08:00:00Z',
      request: {
        charge: 0, multiplicity: 1, method: 'b3lyp', basis: 'def2-svp', scfType: 'df',
        threads: 4, memoryMb: 2048, timeoutSeconds: 3600,
        maxSteps: 50, fullHessianEvery: 5, convergence: 'gau',
        moleculeRevisionId: 'rev-1',
      },
    }
    expect(jobParameterRows(tsRefine, { variant: 'full' })).toEqual([
      ['任务类型', 'Psi4 过渡态精修'],
      ['原子', '版本快照'],
      ['电荷', '0'],
      ['多重度', '1'],
      ['理论水平', 'b3lyp/def2-svp'],
      ['SCF', 'DF'],
      ['线程', '4'],
      ['内存', '2048 MB'],
      ['最大步数', '50'],
      ['收敛标准', 'gau'],
    ])
    const compactLabels = jobParameterRows(tsRefine, { variant: 'compact' }).map(([label]) => label)
    expect(compactLabels).not.toContain('线程')
    expect(compactLabels).not.toContain('内存')

    const irc: JobDetail = {
      id: 'j3', kind: 'psi4-irc', status: 'queued', name: 'irc', createdAt: '2026-07-16T08:00:00Z',
      request: {
        charge: 0, multiplicity: 1, method: 'b3lyp', basis: 'def2-svp', scfType: 'pk',
        threads: 4, memoryMb: 2048, timeoutSeconds: 3600,
        direction: 'both', points: 20, stepSize: 0.2, maxSteps: 100,
        moleculeRevisionId: 'rev-2',
      },
    }
    const ircLabels = jobParameterRows(irc).map(([label]) => label)
    expect(ircLabels).toEqual(expect.arrayContaining(['IRC 方向', 'IRC 点数', '最大步数']))
  })

  it('falls back to em dashes when a job has no request payload', () => {
    const job: JobDetail = { id: 'j4', kind: 'future-engine', status: 'created', name: 'x', createdAt: '2026-07-16T08:00:00Z' }
    expect(jobParameterRows(job)).toEqual([
      ['任务类型', 'future-engine'],
      ['原子', '版本快照'],
      ['电荷', '—'],
      ['多重度', '—'],
    ])
  })

  it('formats job durations across seconds, minutes, hours and days', () => {
    expect(formatJobDuration(undefined)).toBe('—')
    expect(formatJobDuration('2026-07-16T08:00:00Z', '2026-07-16T08:00:45Z')).toBe('45s')
    expect(formatJobDuration('2026-07-16T08:00:00Z', '2026-07-16T08:12:30Z')).toBe('12m')
    expect(formatJobDuration('2026-07-16T08:00:00Z', '2026-07-16T10:14:00Z')).toBe('2h 14m')
    expect(formatJobDuration('2026-07-16T08:00:00Z', '2026-07-16T10:00:00Z')).toBe('2h')
    expect(formatJobDuration('2026-07-14T08:00:00Z', '2026-07-16T11:00:00Z')).toBe('2d 3h')
    expect(formatJobDuration('2026-07-16T10:00:00Z', '2026-07-16T08:00:00Z')).toBe('—')
  })
})
