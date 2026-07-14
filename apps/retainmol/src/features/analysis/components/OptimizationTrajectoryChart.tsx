import { useEffect, useMemo, useRef } from 'react'
import { ChartFrame } from '@/components/data'
import type { OptimizationTrajectory } from '../domain/optimizationTrajectory'
import { createAnalysisChart, type AnalysisChartInstance } from '../infrastructure/echartsAdapter'

export function OptimizationTrajectoryChart({ trajectory }: { trajectory: OptimizationTrajectory }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<AnalysisChartInstance | null>(null)
  const summary = useMemo(() => {
    const first = trajectory.frames[0]
    const last = trajectory.frames.at(-1)!
    return `${trajectory.frames.length} 个优化步骤，能量从 ${first.energy.toFixed(6)} 变化到 ${last.energy.toFixed(6)} Hartree，末步梯度 ${last.gradient.toExponential(3)}。`
  }, [trajectory])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    let cancelled = false
    let observer: ResizeObserver | null = null
    void createAnalysisChart(element).then(chart => {
      if (cancelled) {
        chart.dispose()
        return
      }
      chartRef.current = chart
      chart.setOption({
        animation: false,
        grid: { left: 62, right: 62, top: 30, bottom: 48 },
        tooltip: { trigger: 'axis' },
        legend: { data: ['能量', '梯度'] },
        xAxis: { type: 'category', name: '优化步', data: trajectory.frames.map(frame => frame.step) },
        yAxis: [
          { type: 'value', name: 'Energy (Eh)', scale: true },
          { type: 'log', name: 'Gradient', min: 'dataMin' },
        ],
        series: [
          {
            name: '能量',
            type: 'line',
            showSymbol: trajectory.frames.length < 80,
            data: trajectory.frames.map(frame => frame.energy),
            lineStyle: { color: '#111111', width: 2 },
            itemStyle: { color: '#111111' },
          },
          {
            name: '梯度',
            type: 'line',
            yAxisIndex: 1,
            showSymbol: trajectory.frames.length < 80,
            data: trajectory.frames.map(frame => Math.max(frame.gradient, Number.MIN_VALUE)),
            lineStyle: { color: '#737373', width: 1.5, type: 'dashed' },
            itemStyle: { color: '#737373' },
          },
        ],
      })
      observer = new ResizeObserver(() => chart.resize())
      observer.observe(element)
    })
    return () => {
      cancelled = true
      observer?.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [trajectory])

  return (
    <ChartFrame
      title="xTB 几何优化收敛"
      description={`${trajectory.engine.toUpperCase()} · ${trajectory.frames.length} steps · 真实任务 Artifact`}
      accessibleSummary={summary}
      minHeight={360}
    >
      <div ref={containerRef} className="absolute inset-0" role="img" aria-label={summary} />
    </ChartFrame>
  )
}
