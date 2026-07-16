import { describe, expect, it } from 'vitest'
import { calculationLabel, formatArtifactSize, jobStatusLabel } from './jobPresentation'

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
})
