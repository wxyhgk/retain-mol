import { MeasurePanel } from '@/features/measure'

export function MeasureSection() {
  return (
    <div className="border-b border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/20">
      <div className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-300">测量 · 叠加横幅</div>
      <MeasurePanel compact />
    </div>
  )
}
