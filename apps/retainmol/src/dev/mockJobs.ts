import type { JobDetail, JobSummary, WorkbenchGraphData } from '@retainmol/jobs'

/**
 * 组件展示台的假数据:覆盖全部状态/计算类型,名称沿用 shelf lab 的中文风格。
 * 只用于 /lab/components,不进入生产页面。
 */
export const MOCK_JOBS: JobSummary[] = [
  {
    id: '20260716-gd0163', kind: 'xtb-optimization', status: 'succeeded',
    name: 'GD163 乙醇优化', createdAt: '2026-07-16T15:54:31Z', updatedAt: '2026-07-16T15:55:06Z',
  },
  {
    id: '20260716-ch4-freq', kind: 'psi4-frequency', status: 'succeeded',
    name: 'CH₄ 频率分析', createdAt: '2026-07-16T08:41:18Z', updatedAt: '2026-07-16T08:45:10Z',
  },
  {
    id: '20260715-ts-guess', kind: 'ts-initial-guess', status: 'created',
    name: '浏览器 TS 前置验证 · TS initial guess', createdAt: '2026-07-16T00:08:01Z',
  },
  {
    id: '20260715-ts-refine', kind: 'psi4-ts-refine', status: 'running',
    name: '苯环 SN2 过渡态精修', createdAt: '2026-07-16T11:20:00Z',
  },
  {
    id: '20260714-irc', kind: 'psi4-irc', status: 'queued',
    name: 'IRC 正向路径扫描', createdAt: '2026-07-14T22:42:33Z',
  },
  {
    id: '20260714-opt-fail', kind: 'xtb-optimization', status: 'failed',
    name: 'GDG1630 构象优化(失败)', createdAt: '2026-07-14T15:37:42Z', updatedAt: '2026-07-14T15:39:01Z',
  },
  {
    id: '20260714-opt-cancel', kind: 'xtb-optimization', status: 'cancelled',
    name: '水分子二聚体优化', createdAt: '2026-07-14T14:47:35Z', updatedAt: '2026-07-14T14:48:00Z',
  },
  {
    id: '20260713-freq-stop', kind: 'psi4-frequency', status: 'interrupted',
    name: '氨分子频率(被中断)', createdAt: '2026-07-13T09:12:00Z', updatedAt: '2026-07-13T09:31:00Z',
  },
]

export const MOCK_JOB_DETAIL: JobDetail = {
  id: '20260716-gd0163', kind: 'xtb-optimization', status: 'succeeded',
  name: 'GD163 乙醇优化', createdAt: '2026-07-16T15:54:31Z', updatedAt: '2026-07-16T15:55:06Z',
  request: {
    charge: 0, multiplicity: 1, method: 'gfn2', maxSteps: 300, optLevel: 'normal',
    moleculeRevisionId: 'rev-gd0163-abc123',
  },
  artifacts: [
    {
      id: 'art-input-snapshot', jobId: '20260716-gd0163', role: 'input',
      name: 'input-snapshot.json', format: 'json', mediaType: 'application/json',
      sizeBytes: 2048, createdAt: '2026-07-16T15:54:31Z',
    },
    {
      id: 'art-optimized-xyz', jobId: '20260716-gd0163', role: 'output',
      name: 'optimized.xyz', format: 'xyz', mediaType: 'chemical/x-xyz',
      sizeBytes: 1320, createdAt: '2026-07-16T15:55:02Z',
    },
    {
      id: 'art-trajectory', jobId: '20260716-gd0163', role: 'output',
      name: 'optimization-trajectory.json', format: 'trajectory-json', mediaType: 'application/json',
      sizeBytes: 18432, createdAt: '2026-07-16T15:55:02Z',
    },
    {
      id: 'art-thumb', jobId: '20260716-gd0163', role: 'preview',
      name: 'thumbnail.png', format: 'png', mediaType: 'image/png',
      sizeBytes: 40960, createdAt: '2026-07-16T15:55:04Z',
    },
  ],
}

/** 分叉 + 合流的依赖图样例(反应物/产物 → TS 初猜 → 精修 → 频率/IRC)。 */
export const MOCK_GRAPH: WorkbenchGraphData = {
  nodes: [
    { jobId: 'mock-reactant', name: '反应物优化', kindLabel: 'xTB 几何优化', status: 'succeeded', statusLabel: '已完成', elapsedLabel: '27s' },
    { jobId: 'mock-product', name: '产物优化', kindLabel: 'xTB 几何优化', status: 'succeeded', statusLabel: '已完成', elapsedLabel: '29s' },
    { jobId: 'mock-ts-guess', name: 'TS 初猜', kindLabel: 'ts-initial-guess', status: 'succeeded', statusLabel: '已完成', elapsedLabel: '1m' },
    { jobId: 'mock-ts-refine', name: 'TS 精修', kindLabel: 'Psi4 过渡态精修', status: 'running', statusLabel: '运行中', elapsedLabel: '12m' },
    { jobId: 'mock-frequency', name: '频率分析', kindLabel: 'Psi4 频率分析', status: 'queued', statusLabel: '等待中' },
    { jobId: 'mock-irc', name: 'IRC 路径', kindLabel: 'Psi4 IRC', status: 'created', statusLabel: '已创建' },
  ],
  edges: [
    { sourceJobId: 'mock-reactant', targetJobId: 'mock-ts-guess', label: 'optimized.xyz' },
    { sourceJobId: 'mock-product', targetJobId: 'mock-ts-guess', label: 'optimized.xyz' },
    { sourceJobId: 'mock-ts-guess', targetJobId: 'mock-ts-refine', label: 'ts-guess.xyz' },
    { sourceJobId: 'mock-ts-refine', targetJobId: 'mock-frequency', label: 'transition-state.xyz' },
    { sourceJobId: 'mock-ts-refine', targetJobId: 'mock-irc', label: 'transition-state.xyz' },
  ],
}
