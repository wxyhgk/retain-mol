import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { StatusPill } from './status-pill'
import { Chip } from './chip'
import { middleEllipsis } from './mono-id'
import { ElapsedTime } from './elapsed-time'
import { formatDuration } from '../hooks/use-ticker'

describe('ui-kit atoms', () => {
  it('StatusPill renders tone classes and pulse dot', () => {
    const html = renderToStaticMarkup(<StatusPill label="运行中" tone="emphasis" pulse size="sm" />)
    expect(html).toContain('运行中')
    expect(html).toContain('animate-pulse')
    const noPulse = renderToStaticMarkup(<StatusPill label="ok" tone="success" />)
    expect(noPulse).not.toContain('animate-pulse')
  })

  it('Chip renders mono variant', () => {
    const html = renderToStaticMarkup(<Chip mono>B3LYP/def2-SVP</Chip>)
    expect(html).toContain('font-mono')
    expect(html).toContain('B3LYP/def2-SVP')
  })

  it('middleEllipsis keeps head and tail', () => {
    expect(middleEllipsis('short-id')).toBe('short-id')
    const long = middleEllipsis('20260716-abcdef1234567890-xyz', 20)
    expect(long).toContain('…')
    expect(long.startsWith('20260716')).toBe(true)
    expect(long.endsWith('xyz')).toBe(true)
    expect(long.length).toBeLessThanOrEqual(20)
  })

  it('formatDuration covers hour/minute/second buckets and invalid input', () => {
    expect(formatDuration(38_000)).toBe('38s')
    expect(formatDuration(45 * 60_000 + 12_000)).toBe('45m 12s')
    expect(formatDuration(2 * 3_600_000 + 11 * 60_000)).toBe('2h 11m')
    expect(formatDuration(-5)).toBe('—')
    expect(formatDuration(Number.NaN)).toBe('—')
  })

  it('ElapsedTime renders static duration without live ticking', () => {
    const html = renderToStaticMarkup(
      <ElapsedTime since="2026-07-16T08:00:00Z" until="2026-07-16T09:26:00Z" prefix="耗时 " />,
    )
    expect(html).toContain('耗时 1h 26m')
  })
})
