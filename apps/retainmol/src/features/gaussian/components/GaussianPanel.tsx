import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@/store/moleculeStore'
import { cn } from '@/lib/utils'
import { DEFAULT_GAUSSIAN_CONFIG, type GaussianJobConfig, type GaussianCalcType, type GaussianSolventModel } from '../types'
import { generateGaussianInput } from '../io/inputGenerator'
import { METHOD_GROUPS, ALL_METHODS } from '../config/methods'
import { BASIS_SET_GROUPS, ALL_BASIS_SETS } from '../config/basisSets'
import { SOLVENT_OPTIONS } from '../config/solvents'

// ── 兼容旧 UI 的本地常量（后续拆到各 tab 组件时删掉）──
const GAUSSIAN_METHODS = METHOD_GROUPS
const GAUSSIAN_BASIS_SETS = BASIS_SET_GROUPS
const GAUSSIAN_MEMORY_OPTIONS = ['1GB', '2GB', '4GB', '8GB', '16GB', '32GB']
const GAUSSIAN_SOLVENTS = SOLVENT_OPTIONS.map(s => s.id)

interface Props {
  open: boolean
  onClose: () => void
}

const CALC_TYPES: { id: GaussianCalcType; label: string; desc: string }[] = [
  { id: 'sp',       label: '单点能',   desc: 'Single Point' },
  { id: 'opt',      label: '结构优化', desc: 'Optimization' },
  { id: 'freq',     label: '频率分析', desc: 'Frequency' },
  { id: 'opt freq', label: '优化+频率', desc: 'Opt + Freq' },
]

function download(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function GaussianJobDialog({ open, onClose }: Props) {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const [cfg, setCfg] = useState<GaussianJobConfig>({
    ...DEFAULT_GAUSSIAN_CONFIG,
    title: molecule.name || 'molecule',
  })
  const [tab, setTab] = useState<'basic' | 'job' | 'preview'>('basic')

  const set = <K extends keyof GaussianJobConfig>(key: K, val: GaussianJobConfig[K]) =>
    setCfg(prev => ({ ...prev, [key]: val }))

  const preview = useMemo(() => generateGaussianInput(molecule, cfg), [molecule, cfg])

  const handleExport = () => {
    const name = (cfg.title || molecule.name || 'molecule').replace(/\s+/g, '_')
    download(preview, `${name}.gjf`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl bg-white p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-gray-200">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            生成 Gaussian 输入文件
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            {molecule.atoms.length} 个原子 · {molecule.bonds.length} 条键
          </p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-5 gap-5 bg-gray-50/50">
          {(['basic', 'job', 'preview'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px',
                tab === t
                  ? 'border-[#007AFF] text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              {{ basic: '计算设置', job: '作业参数', preview: '预览 / 导出' }[t]}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh]">

          {/* ── 计算设置 ── */}
          {tab === 'basic' && (
            <div className="space-y-5">

              {/* 计算类型 */}
              <div>
                <Label>计算类型</Label>
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {CALC_TYPES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => set('calcType', c.id)}
                      className={cn(
                        'flex flex-col items-center py-2 px-1 rounded-lg border text-xs transition-all',
                        cfg.calcType === c.id
                          ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <span className="font-medium">{c.label}</span>
                      <span className="text-[10px] opacity-60 mt-0.5">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 方法 */}
              <div>
                <Label>计算方法</Label>
                <div className="mt-1.5 space-y-2">
                  {GAUSSIAN_METHODS.map(g => (
                    <div key={g.group}>
                      <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">{g.group}</div>
                      <div className="flex flex-wrap gap-1">
                        {g.items.map(m => (
                          <button
                            key={m.id}
                            onClick={() => set('method', m.id)}
                            title={m.desc}
                            className={cn(
                              'px-2.5 py-1 rounded-md border text-xs font-mono transition-all',
                              cfg.method === m.id
                                ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            )}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* 自定义输入 */}
                  <input
                    className="mt-1 w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 font-mono focus:outline-none focus:border-[#007AFF]"
                    placeholder="自定义方法（如 B3LYP-D3BJ）"
                    value={ALL_METHODS.includes(cfg.method) ? '' : cfg.method}
                    onChange={e => e.target.value && set('method', e.target.value)}
                  />
                </div>
              </div>

              {/* 基组 */}
              <div>
                <Label>基组</Label>
                <div className="mt-1.5 space-y-2">
                  {GAUSSIAN_BASIS_SETS.map(g => (
                    <div key={g.group}>
                      <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">{g.group}</div>
                      <div className="flex flex-wrap gap-1">
                        {g.items.map(b => (
                          <button
                            key={b.id}
                            onClick={() => set('basisSet', b.id)}
                            title={b.desc}
                            className={cn(
                              'px-2.5 py-1 rounded-md border text-xs font-mono transition-all',
                              cfg.basisSet === b.id
                                ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            )}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <input
                    className="mt-1 w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 font-mono focus:outline-none focus:border-[#007AFF]"
                    placeholder="自定义基组（如 def2-TZVPP）"
                    value={ALL_BASIS_SETS.includes(cfg.basisSet) ? '' : cfg.basisSet}
                    onChange={e => e.target.value && set('basisSet', e.target.value)}
                  />
                </div>
              </div>

              {/* 溶剂 */}
              <div>
                <Label>溶剂模型</Label>
                <div className="flex gap-2 mt-1.5">
                  {(['none', 'PCM', 'SMD'] as GaussianSolventModel[]).map(m => (
                    <button
                      key={m}
                      onClick={() => set('solventModel', m)}
                      className={cn(
                        'px-3 py-1.5 rounded-md border text-xs transition-all',
                        cfg.solventModel === m
                          ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      {m === 'none' ? '无溶剂（气相）' : m}
                    </button>
                  ))}
                </div>
                {cfg.solventModel !== 'none' && (
                  <select
                    className="mt-2 w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#007AFF] bg-white"
                    value={cfg.solvent}
                    onChange={e => set('solvent', e.target.value)}
                  >
                    {GAUSSIAN_SOLVENTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* ── 作业参数 ── */}
          {tab === 'job' && (
            <div className="space-y-4">

              {/* 标题 */}
              <Row label="任务标题">
                <input
                  className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#007AFF]"
                  value={cfg.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="molecule"
                />
              </Row>

              {/* 电荷 多重度 */}
              <Row label="电荷 / 多重度">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 mb-1">电荷</div>
                    <input
                      type="number"
                      className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#007AFF]"
                      value={cfg.charge}
                      onChange={e => set('charge', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 mb-1">多重度</div>
                    <select
                      className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#007AFF] bg-white"
                      value={cfg.multiplicity}
                      onChange={e => set('multiplicity', parseInt(e.target.value))}
                    >
                      <option value={1}>1 单重态</option>
                      <option value={2}>2 二重态</option>
                      <option value={3}>3 三重态</option>
                      <option value={4}>4 四重态</option>
                      <option value={5}>5 五重态</option>
                    </select>
                  </div>
                </div>
              </Row>

              {/* 内存 */}
              <Row label="内存">
                <div className="flex flex-wrap gap-1.5">
                  {GAUSSIAN_MEMORY_OPTIONS.map(m => (
                    <button
                      key={m}
                      onClick={() => set('memory', m)}
                      className={cn(
                        'px-3 py-1.5 rounded-md border text-xs font-mono transition-all',
                        cfg.memory === m
                          ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Row>

              {/* CPU 核数 */}
              <Row label="CPU 核数">
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={1} max={32} step={1}
                    value={cfg.nproc}
                    onChange={e => set('nproc', parseInt(e.target.value))}
                    className="flex-1 accent-[#007AFF]"
                  />
                  <span className="text-xs font-mono text-gray-700 w-8 text-right">{cfg.nproc}</span>
                </div>
              </Row>

              {/* 额外关键词 */}
              <Row label="额外关键词">
                <input
                  className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 font-mono focus:outline-none focus:border-[#007AFF]"
                  value={cfg.extraKeywords}
                  onChange={e => set('extraKeywords', e.target.value)}
                  placeholder="例：EmpiricalDispersion=GD3BJ Pop=NBO"
                />
              </Row>
            </div>
          )}

          {/* ── 预览 ── */}
          {tab === 'preview' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {(cfg.title || molecule.name || 'molecule').replace(/\s+/g, '_')}.gjf
                </span>
                <button
                  onClick={() => navigator.clipboard?.writeText(preview)}
                  className="text-[11px] text-[#007AFF] hover:underline"
                >
                  复制
                </button>
              </div>
              <pre className="text-[11px] font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto max-h-80 text-gray-700 leading-relaxed whitespace-pre">
                {preview}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50/50">
          <div className="text-xs text-gray-400">
            {cfg.method}/{cfg.basisSet} · {CALC_TYPES.find(c => c.id === cfg.calcType)?.label}
            {cfg.solventModel !== 'none' && ` · ${cfg.solventModel}(${cfg.solvent})`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={molecule.atoms.length === 0}
              className="px-4 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-700 disabled:opacity-40 transition-colors font-medium"
            >
              导出 .gjf
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-gray-700 mb-1">{children}</div>
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}
