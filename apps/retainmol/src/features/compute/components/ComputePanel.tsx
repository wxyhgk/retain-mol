/**
 * ComputePanel — 数据驱动的计算任务面板
 * 新增计算类型只需在 registry/ 下注册一个 config，不改本文件。
 */

// 导入所有已注册的计算类型（side-effect import，触发 registerCalcType 调用）
import '../registry/geo_opt'

import { useState, useMemo } from 'react'
import { Play, X, ChevronDown, ChevronRight, Loader2, CheckCircle, XCircle, LineChart } from 'lucide-react'
import { allCalcTypes, calcTypesByCategory } from '../registry/index'
import { useComputeStore } from '../store/computeStore'
import { useXtbStore } from '@/store/xtbStore'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@/store/moleculeStore'
import { CATEGORY_LABEL } from '../types'
import type { CalcCategory, BackendImpl } from '../types'
import JobForm from './JobForm'
import { cn } from '@/lib/utils'

export default function ComputePanel() {
  const grouped = useMemo(() => calcTypesByCategory(), [])
  const allTypes = useMemo(() => allCalcTypes(), [])

  const [activeCat, setActiveCat] = useState<CalcCategory>(() =>
    (grouped.keys().next().value as CalcCategory) ?? 'structure'
  )
  const [expandedTypeId, setExpandedTypeId] = useState<string | null>(() =>
    grouped.get((grouped.keys().next().value as CalcCategory) ?? 'structure')?.[0]?.id ?? null
  )
  const [selectedBackendId, setSelectedBackendId] = useState<string | null>(null)
  const [inputValues, setInputValues] = useState<Record<string, unknown>>({})
  const [running, setRunning] = useState(false)

  const { jobs, removeJob } = useComputeStore()
  const { showCurve, setShowCurve, frames } = useXtbStore()

  const expandedType = allTypes.find(t => t.id === expandedTypeId) ?? null
  const backend: BackendImpl | null = expandedType
    ? (expandedType.backends.find(b => b.id === selectedBackendId)
        ?? expandedType.backends.find(b => b.available)
        ?? expandedType.backends[0]
        ?? null)
    : null

  // 合并 commonFields + backend.extraFields，初始化缺失的值
  const formSchema = useMemo(() => [
    ...(expandedType?.commonFields ?? []),
    ...(backend?.extraFields ?? []),
  ], [expandedType, backend])

  const mergedValues = useMemo(() => {
    const defaults: Record<string, unknown> = {}
    for (const f of formSchema) {
      if (f.kind === 'select' && !(f.key in inputValues)) defaults[f.key] = f.options[0]?.value
      if (f.kind === 'number' && !(f.key in inputValues)) defaults[f.key] = 0
      if (f.kind === 'toggle' && !(f.key in inputValues)) defaults[f.key] = false
    }
    return { ...backend?.defaultInput, ...defaults, ...inputValues }
  }, [formSchema, backend, inputValues])

  const handleTypeSelect = (typeId: string) => {
    const t = allTypes.find(x => x.id === typeId)
    if (!t) return
    setExpandedTypeId(prev => prev === typeId ? null : typeId)
    setSelectedBackendId(t.backends.find(b => b.available)?.id ?? t.backends[0]?.id ?? null)
    setInputValues({})
  }

  const handleRun = async () => {
    if (!expandedType || !backend || running) return
    const mol = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
    if (mol.atoms.length < 2) { alert('至少需要 2 个原子'); return }

    const { startJob } = useComputeStore.getState()
    const { activeObjectId } = useMoleculeStore.getState()
    const jobId = startJob({
      typeId: expandedType.id,
      typeLabel: expandedType.label,
      backendId: backend.id,
      backendLabel: backend.label,
      objectId: activeObjectId ?? '',
      progress: undefined,
    })

    setRunning(true)
    try {
      await backend.run(mol, mergedValues, jobId)
    } catch {
      // error already written to store by run()
    } finally {
      setRunning(false)
    }
  }

  const categories = [...grouped.keys()] as CalcCategory[]

  return (
    <div className="flex flex-col h-full text-sm">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* ── 类别筛选 ── */}
        {categories.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors',
                  activeCat === cat
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                )}>
                {CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>
        )}

        {/* ── 计算类型列表 ── */}
        <div className="space-y-1">
          {(grouped.get(activeCat) ?? []).map(calcType => {
            const isExpanded = expandedTypeId === calcType.id
            const activeBackend = calcType.backends.find(b => b.id === selectedBackendId && isExpanded)
              ?? calcType.backends.find(b => b.available)
              ?? calcType.backends[0]

            return (
              <div key={calcType.id} className="rounded-lg border border-gray-200 overflow-hidden">
                {/* 类型标题行 */}
                <button
                  onClick={() => handleTypeSelect(calcType.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                    isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                  )}
                >
                  {isExpanded
                    ? <ChevronDown size={13} className="text-gray-400 shrink-0" />
                    : <ChevronRight size={13} className="text-gray-400 shrink-0" />}
                  <span className="text-xs font-medium text-gray-800 flex-1">{calcType.label}</span>
                  {calcType.description && !isExpanded && (
                    <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{calcType.description}</span>
                  )}
                </button>

                {/* 展开：后端选择 + 表单 + 运行 */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-2 border-t border-gray-100 space-y-3 bg-white">

                    {/* 后端选择 */}
                    {calcType.backends.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 w-10 shrink-0">后端</span>
                        <div className="flex flex-wrap gap-1">
                          {calcType.backends.map(b => (
                            <button key={b.id}
                              disabled={!b.available}
                              onClick={() => { setSelectedBackendId(b.id); setInputValues({}) }}
                              className={cn(
                                'px-2 py-0.5 rounded-md text-[11px] border transition-colors',
                                !b.available && 'opacity-40 cursor-not-allowed',
                                (b.id === activeBackend?.id)
                                  ? 'bg-gray-800 border-gray-800 text-white'
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                              )}>
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 参数表单 */}
                    <JobForm schema={formSchema} values={mergedValues}
                      onChange={(k, v) => setInputValues(prev => ({ ...prev, [k]: v }))} />

                    {/* 运行按钮 */}
                    <button
                      onClick={handleRun}
                      disabled={running || !activeBackend?.available}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                        running || !activeBackend?.available
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#007AFF] text-white hover:bg-[#0066dd]'
                      )}>
                      {running
                        ? <><Loader2 size={12} className="animate-spin" />运行中…</>
                        : <><Play size={12} />运行</>}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── 任务历史 ── */}
        {jobs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-gray-600">最近任务</span>
              {frames.length > 0 && (
                <button onClick={() => setShowCurve(!showCurve)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border transition-colors',
                    showCurve
                      ? 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                  )}>
                  <LineChart size={10} />曲线
                </button>
              )}
            </div>
            <div className="space-y-1">
              {jobs.map(job => (
                <div key={job.id}
                  className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2">
                  {/* 状态图标 */}
                  <div className="mt-0.5 shrink-0">
                    {job.status === 'running' && <Loader2 size={12} className="animate-spin text-[#007AFF]" />}
                    {job.status === 'done'    && <CheckCircle size={12} className="text-green-500" />}
                    {job.status === 'error'   && <XCircle size={12} className="text-red-400" />}
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-gray-800 truncate">
                      {job.typeLabel}
                      <span className="ml-1 font-normal text-gray-400">· {job.backendLabel}</span>
                    </div>
                    {job.status === 'running' && job.progress && (
                      <div className="text-[10px] text-[#007AFF] font-mono mt-0.5">{job.progress.message}</div>
                    )}
                    {job.status === 'done' && job.result && (
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {typeof job.result.energy === 'number' && `${(job.result.energy as number).toFixed(6)} Eh`}
                        {job.result.converged === true  && <span className="text-green-600 ml-1">✓ 收敛</span>}
                        {job.result.converged === false && <span className="text-amber-500 ml-1">⚠ 未收敛</span>}
                        {typeof job.result.steps === 'number' && ` · ${job.result.steps} 步`}
                      </div>
                    )}
                    {job.status === 'error' && (
                      <div className="text-[10px] text-red-500 mt-0.5 break-all">{job.error}</div>
                    )}
                  </div>

                  {/* 删除 */}
                  {job.status !== 'running' && (
                    <button onClick={() => removeJob(job.id)}
                      className="text-gray-300 hover:text-gray-500 shrink-0 mt-0.5">
                      <X size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-[10px] text-gray-400">后端需运行 uvicorn main:app --port 8000</div>
      </div>
    </div>
  )
}
