import { Suspense, lazy } from 'react'
import { DrawPanel, useBuildPaletteController } from '@/features/build-palette'
import type { LeftRailKey } from './LeftRail'

const KetcherPanel = lazy(() => import('@/features/ketcher').then(m => ({ default: m.KetcherPanel })))

export function LeftPanels({ activeKey, ketcherWidth = 720 }: { activeKey: LeftRailKey; ketcherWidth?: number }) {
  const controller = useBuildPaletteController()

  if (activeKey === 'draw') {
    return <DrawPanel controller={controller} />
  }
  if (activeKey === 'ketcher') {
    return (
      <div className="flex h-[68vh] min-h-[420px] flex-col" style={{ width: ketcherWidth }}>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold">2D 草图</div>
          <div className="text-[11px] text-muted-foreground">2D ↔ 3D 自动同步</div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-white">
          <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground">加载 2D 编辑器…</div>}>
            <KetcherPanel />
          </Suspense>
        </div>
      </div>
    )
  }
  if (activeKey === 'template') {
    return (
      <div className="space-y-3">
        <div className="text-xs font-semibold">模板</div>
        <p className="text-xs text-muted-foreground">从模板库选择片段，点击画布放置。后续接入 TemplateLibrary 弹层。</p>
        <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">Template Gallery（占位）</div>
      </div>
    )
  }
  if (activeKey === 'select') {
    return (
      <div className="space-y-3">
        <div className="text-xs font-semibold">选择</div>
        <p className="text-xs text-muted-foreground">框选 / 点选原子与键，详情在右侧属性查看。元素请用右侧元素按钮。</p>
      </div>
    )
  }
  if (activeKey === 'move') {
    return (
      <div className="space-y-3">
        <div className="text-xs font-semibold">移动</div>
        <p className="text-xs text-muted-foreground">拖拽移动原子，Alt+拖拽旋转。后续接入对齐/镜像工具。</p>
      </div>
    )
  }
  if (activeKey === 'measure') {
    return (
      <div className="space-y-3">
        <div className="text-xs font-semibold">测量</div>
        <p className="text-xs text-muted-foreground">点击 2/3/4 个原子测量距离/角度/二面角，Enter 确认 Esc 取消。</p>
      </div>
    )
  }
  if (activeKey === 'erase') {
    return (
      <div className="space-y-3">
        <div className="text-xs font-semibold">擦除</div>
        <p className="text-xs text-muted-foreground">点击原子/键删除，或 Delete 删除选中。</p>
      </div>
    )
  }
  return null
}
