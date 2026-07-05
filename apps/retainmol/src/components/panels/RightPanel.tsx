import { useMoleculeStore, useEditorStore, selectActiveMoleculeOrEmpty, cn } from '@retainmol/mol-viewer'
import { GeometryPanel } from '@/features/geometry'
import { MeasurePanel } from '@/features/measure'
import ScenePanel from '@/features/scene/components/ScenePanel'
import StylePanel from '@/features/style/components/StylePanel'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Link2, FlaskRound, Eraser, Sparkles } from 'lucide-react'

export default function RightPanel() {
  const { autoInferBonds, addHydrogens, clearMolecule, cleanupGeometry } = useMoleculeStore()
  const flashHint = useEditorStore(s => s.flashHint)
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)

  const handleCleanup = () => {
    const r = cleanupGeometry()
    if (!r.ok && r.reason) flashHint(r.reason)
  }

  return (
    <Tabs defaultValue="scene" className="h-full flex flex-col min-h-0">

      {/* ── 顶部：分子名 + 编辑操作 ── */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-800 flex-1 truncate">
          {molecule.name || 'New Molecule'}
        </span>
        <div className="flex items-center gap-0.5">
          <ActionBtn icon={<Sparkles size={11} />} label="清理几何" onClick={handleCleanup} />
          <ActionBtn icon={<Link2 size={11} />} label="推断键" onClick={autoInferBonds} />
          <ActionBtn icon={<FlaskRound size={11} />} label="补氢" onClick={() => addHydrogens()} />
          <ActionBtn
            icon={<Eraser size={11} />} label="清空" danger
            onClick={() => { if (confirm('清空所有原子和键？')) clearMolecule() }}
          />
        </div>
      </div>

      {/* ── Tab 选择栏 ── */}
      <div className="shrink-0 px-2 pt-2 pb-1.5 border-b border-gray-100">
        <TabsList className="grid grid-cols-4 w-full h-8 bg-gray-100 p-0.5 rounded-lg">
          <TabsTrigger value="scene"    className="text-[11px] font-medium h-7 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500">场景</TabsTrigger>
          <TabsTrigger value="style"    className="text-[11px] font-medium h-7 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500">样式</TabsTrigger>
          <TabsTrigger value="geometry" className="text-[11px] font-medium h-7 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500">几何</TabsTrigger>
          <TabsTrigger value="measure"  className="text-[11px] font-medium h-7 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500">测量</TabsTrigger>
        </TabsList>
      </div>

      {/* ── 可滚动内容区 ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <TabsContent value="scene"    className="mt-0"><ScenePanel /></TabsContent>
        <TabsContent value="style"    className="mt-0"><StylePanel /></TabsContent>
        <TabsContent value="geometry" className="mt-0"><GeometryPanel /></TabsContent>
        <TabsContent value="measure"  className="mt-0"><MeasurePanel /></TabsContent>
      </div>

    </Tabs>
  )
}

function ActionBtn({ icon, label, onClick, danger = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
        danger
          ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
      )}
    >
      {icon}
    </button>
  )
}
