import { Cpu, Loader2, Sparkles } from 'lucide-react'
import { selectAppBusyMessage, useAppTaskStore } from '@/store/appTaskStore'
import { runGeometryOptimization } from '../application/runGeometryOptimization'
import { useOptimizationTaskStore } from '../model/optimizationTaskStore'

interface OptimizationControlsProps {
  atomCount: number
  bondCount: number
}

export function OptimizationControls({ atomCount, bondCount }: OptimizationControlsProps) {
  const activeKind = useOptimizationTaskStore(state => state.activeKind)
  const message = useOptimizationTaskStore(state => state.message)
  const globalBusy = useAppTaskStore(selectAppBusyMessage)
  const disabled = activeKind !== null || globalBusy !== null

  return (
    <section>
      <div className="text-xs font-medium text-gray-700 mb-2">几何优化</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled || bondCount === 0}
          title={globalBusy ?? (bondCount === 0 ? '快速优化需要分子包含键' : '使用 MMFF94，失败时回退 UFF')}
          onClick={() => void runGeometryOptimization('forcefield')}
          className="flex min-h-14 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {activeKind === 'forcefield' ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-gray-800">快速优化</span>
            <span className="block text-[10px] text-gray-400">MMFF94 / UFF</span>
          </span>
        </button>
        <button
          type="button"
          disabled={disabled || atomCount < 2}
          title={globalBusy ?? (atomCount < 2 ? 'xTB 至少需要两个原子' : '使用后端 GFN2-xTB 精修')}
          onClick={() => void runGeometryOptimization('xtb')}
          className="flex min-h-14 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {activeKind === 'xtb' ? <Loader2 size={15} className="animate-spin" /> : <Cpu size={15} />}
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-gray-800">精修</span>
            <span className="block text-[10px] text-gray-400">GFN2-xTB</span>
          </span>
        </button>
      </div>
      {message && (
        <p className="mt-1.5 break-words text-[10px] leading-relaxed text-gray-500">{message}</p>
      )}
      <p className="mt-1 text-[10px] text-gray-400">二维结构导入时只生成初始 3D；优化需手动执行</p>
    </section>
  )
}
