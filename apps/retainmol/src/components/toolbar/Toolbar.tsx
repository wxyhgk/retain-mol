import { RotateCcw, Download, Upload, Search } from 'lucide-react'
import {
  useMoleculeTemporal, cn,
} from '@retainmol/mol-viewer'
import { useStore } from 'zustand'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useFileIO } from '@/hooks/useFileIO'

interface ToolbarProps {
  showInspector: boolean
  onToggleInspector: () => void
  onSearchOpen: () => void
}

export default function Toolbar({ showInspector, onToggleInspector, onSearchOpen }: ToolbarProps) {
  const { undo, redo, pastStates, futureStates } = useStore(useMoleculeTemporal)
  const { importXYZ, importMolSdf, importXYZToScene, importMolSdfToScene, exportCurrentXYZ, exportCurrentMol, exportCurrentSdf } = useFileIO()

  return (
    <TooltipProvider delayDuration={300}>
      <header className="h-11 shrink-0 flex items-center px-3 gap-2 bg-white border-b border-gray-200 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] select-none">

        {/* 品牌 */}
        <span className="text-gray-900 font-semibold tracking-tight text-sm">RetainMol</span>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* 撤销 / 重做 */}
        <Tip label="撤销 (Ctrl+Z)" side="bottom">
          <Button variant="ghost" size="icon"
            className="w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30"
            onClick={() => undo()} disabled={pastStates.length === 0}>
            <RotateCcw size={14} />
          </Button>
        </Tip>
        <Tip label="重做 (Ctrl+Y)" side="bottom">
          <Button variant="ghost" size="icon"
            className="w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30"
            onClick={() => redo()} disabled={futureStates.length === 0}>
            <RotateCcw size={14} className="scale-x-[-1]" />
          </Button>
        </Tip>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* 导入 */}
        <DropdownMenu>
          <Tip label="导入文件" side="bottom">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                <Upload size={14} />
              </Button>
            </DropdownMenuTrigger>
          </Tip>
          <DropdownMenuContent side="bottom" className="bg-white border-gray-200 shadow-lg">
            <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wider">替换当前</div>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={importXYZ}>XYZ</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={importMolSdf}>MOL / SDF</DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wider">添加到场景</div>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={importXYZToScene}>XYZ</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={importMolSdfToScene}>MOL / SDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 导出 */}
        <DropdownMenu>
          <Tip label="导出文件" side="bottom">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                <Download size={14} />
              </Button>
            </DropdownMenuTrigger>
          </Tip>
          <DropdownMenuContent side="bottom" className="bg-white border-gray-200 shadow-lg">
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={exportCurrentXYZ}>导出 XYZ</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={exportCurrentMol}>导出 MOL</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={exportCurrentSdf}>导出 SDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 搜索 */}
        <Tip label="从 PubChem 搜索分子 (Ctrl+K)" side="bottom">
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-xs transition-all"
          >
            <Search size={12} />
            <span>搜索分子…</span>
            <kbd className="ml-1 text-[10px] text-gray-400 font-sans">⌘K</kbd>
          </button>
        </Tip>

        {/* 右侧：检查器切换 */}
        <div className="ml-auto">
          <Tip label={showInspector ? '收起检查器' : '展开检查器'} side="bottom">
            <Button variant="ghost" size="sm"
              className={cn(
                'h-8 px-2.5 rounded-lg text-xs font-medium transition-all',
                showInspector
                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              )}
              onClick={onToggleInspector}>
              检查器
            </Button>
          </Tip>
        </div>

      </header>
    </TooltipProvider>
  )
}

function Tip({ label, children, side = 'right' }: { label: string; children: React.ReactNode; side?: 'right' | 'bottom' | 'left' | 'top' }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="text-xs bg-gray-800 text-white border-gray-700">{label}</TooltipContent>
    </Tooltip>
  )
}
