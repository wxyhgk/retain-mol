import { RotateCcw, Link2, Download, Upload, Eraser, FlaskConical, FlaskRound, Hash, MoreHorizontal, Palette, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@/store/moleculeStore'
import PubChemSearch from '@/components/search/PubChemSearch'
import { listThemes } from '@/presets'
import { useStore } from 'zustand'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useFileIO } from '@/hooks/useFileIO'
import { centerMolecule } from '@/lib/molecule'
import { SAMPLE_MOLECULES } from '@/lib/samples'
import { cn } from '@/lib/utils'

export default function Toolbar({ showProperties, onToggleProperties }: {
  showProperties: boolean
  onToggleProperties: () => void
}) {
  const { setMolecule, clearMolecule, autoInferBonds, addHydrogens,
    showAtomLabels, toggleAtomLabels, themeId, setTheme } = useMoleculeStore()
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const themes = listThemes()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const { undo, redo, pastStates, futureStates } = useStore(useMoleculeStore.temporal)
  const { importXYZ, importMolSdf, exportCurrentXYZ, exportCurrentMol, exportCurrentSdf } = useFileIO()

  const molName = molecule.name ?? 'New Molecule'

  return (
    <TooltipProvider delayDuration={300}>
      <header className="h-11 shrink-0 flex items-center px-3 gap-2 bg-white/90 backdrop-blur-sm border-b border-gray-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] select-none">

        {/* 品牌 */}
        <span className="text-gray-900 font-semibold tracking-tight text-sm mr-1">RetainMol</span>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* 文件名 */}
        <span className="text-gray-500 text-xs max-w-[120px] truncate">{molName}</span>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* PubChem 搜索 */}
        <Tip label="从 PubChem 搜索分子 (Ctrl+K)" side="bottom">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-xs transition-all"
          >
            <Search size={12} />
            <span>搜索分子…</span>
            <kbd className="ml-1 text-[10px] text-gray-400 font-sans">⌘K</kbd>
          </button>
        </Tip>

        {/* 撤销 / 重做 */}
        <Tip label="撤销 (Ctrl+Z)" side="bottom">
          <Button variant="ghost" size="icon"
            className="w-8 h-8 rounded-[8px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30"
            onClick={undo} disabled={pastStates.length === 0}>
            <RotateCcw size={14} />
          </Button>
        </Tip>
        <Tip label="重做 (Ctrl+Y)" side="bottom">
          <Button variant="ghost" size="icon"
            className="w-8 h-8 rounded-[8px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30"
            onClick={redo} disabled={futureStates.length === 0}>
            <RotateCcw size={14} className="scale-x-[-1]" />
          </Button>
        </Tip>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* 导入 */}
        <DropdownMenu>
          <Tip label="导入文件" side="bottom">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[8px] text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                <Upload size={14} />
              </Button>
            </DropdownMenuTrigger>
          </Tip>
          <DropdownMenuContent side="bottom" className="bg-white border-gray-200 shadow-lg">
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={importXYZ}>导入 XYZ</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={importMolSdf}>导入 MOL / SDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 导出 */}
        <DropdownMenu>
          <Tip label="导出文件" side="bottom">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[8px] text-gray-500 hover:text-gray-900 hover:bg-gray-100">
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

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* 属性面板切换 */}
        <Tip label={showProperties ? '收起属性面板' : '展开属性面板'} side="bottom">
          <Button variant="ghost" size="sm"
            className={cn(
              'h-8 px-2.5 rounded-[8px] text-xs font-medium transition-all',
              showProperties
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
            onClick={onToggleProperties}>
            属性
          </Button>
        </Tip>

        {/* 原子标签 */}
        <Tip label={showAtomLabels ? '隐藏原子编号' : '显示原子编号'} side="bottom">
          <Button variant="ghost" size="icon"
            className={cn('w-8 h-8 rounded-[8px] text-gray-500 hover:text-gray-900 hover:bg-gray-100',
              showAtomLabels && 'bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/15 hover:text-[#007AFF]')}
            onClick={toggleAtomLabels}>
            <Hash size={14} />
          </Button>
        </Tip>

        {/* 更多操作 */}
        <DropdownMenu>
          <Tip label="更多操作" side="bottom">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-[8px] text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
          </Tip>
          <DropdownMenuContent side="bottom" align="end" className="bg-white border-gray-200 shadow-lg">
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={autoInferBonds}>
              <Link2 size={13} className="mr-2" />自动推断成键
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={() => addHydrogens()}>
              <FlaskRound size={13} className="mr-2" />全局补氢 (H)
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer"
              onClick={() => { if (confirm('确认清空所有原子和键？')) clearMolecule() }}>
              <Eraser size={13} className="mr-2" />清空分子
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Palette size={11} />主题
            </div>
            {themes.map(t => (
              <DropdownMenuItem key={t.id}
                className={cn('text-gray-700 hover:bg-gray-50 cursor-pointer text-xs',
                  themeId === t.id && 'bg-[#007AFF]/10 text-[#007AFF]')}
                onClick={() => setTheme(t.id)}>
                {t.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <FlaskConical size={11} />示例分子
            </div>
            {SAMPLE_MOLECULES.map(s => (
              <DropdownMenuItem key={s.name}
                className="text-gray-700 hover:bg-gray-50 cursor-pointer text-xs"
                onClick={() => setMolecule(centerMolecule(s.mol()))}>
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <PubChemSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
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
