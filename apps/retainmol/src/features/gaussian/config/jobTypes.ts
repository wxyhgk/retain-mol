import type { GaussianCalcType } from '../types'

export interface JobTypeConfig {
  id: GaussianCalcType
  label: string
  labelEn: string
  desc: string
  /** 这个任务类型需要展示的额外选项 */
  extraOptions?: ('nstates' | 'scanType' | 'ircDirection')[]
}

export const JOB_TYPES: JobTypeConfig[] = [
  {
    id: 'sp',
    label: '单点能',
    labelEn: 'Single Point',
    desc: '计算当前构型的能量，不改变几何结构',
  },
  {
    id: 'opt',
    label: '结构优化',
    labelEn: 'Optimization',
    desc: '寻找势能面极小值（稳定构型）',
  },
  {
    id: 'freq',
    label: '频率分析',
    labelEn: 'Frequency',
    desc: '计算振动频率、热力学量（需在极值点进行）',
  },
  {
    id: 'opt freq',
    label: '优化 + 频率',
    labelEn: 'Opt + Freq',
    desc: '优化后立即做频率，最常用组合',
  },
  {
    id: 'irc',
    label: '内禀反应坐标',
    labelEn: 'IRC',
    desc: '从过渡态出发追踪反应路径（需先找到 TS）',
    extraOptions: ['ircDirection'],
  },
  {
    id: 'td',
    label: '激发态 (TD-DFT)',
    labelEn: 'TD-DFT',
    desc: '计算电子激发能、紫外-可见吸收光谱',
    extraOptions: ['nstates'],
  },
  {
    id: 'nmr',
    label: 'NMR 化学位移',
    labelEn: 'NMR',
    desc: '计算核磁共振化学位移',
  },
  {
    id: 'scan',
    label: '势能面扫描',
    labelEn: 'PES Scan',
    desc: '固定一个或多个内坐标扫描势能面',
    extraOptions: ['scanType'],
  },
]
