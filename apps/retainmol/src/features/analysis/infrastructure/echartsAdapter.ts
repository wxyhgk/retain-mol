import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { init, use as registerEchartsModules } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

registerEchartsModules([
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
])

export interface AnalysisChartInstance {
  setOption(option: unknown, notMerge?: boolean): void
  resize(): void
  dispose(): void
}

export async function createAnalysisChart(element: HTMLElement): Promise<AnalysisChartInstance> {
  return init(element, undefined, { renderer: 'canvas' })
}
