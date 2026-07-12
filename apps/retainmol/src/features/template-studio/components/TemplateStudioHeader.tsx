import { useRef } from 'react'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { getMolecularFormula } from '@retainmol/mol-viewer/core'
import { cn } from '@/lib/utils'
import type { TemplateStudioController } from '../model/useTemplateStudioController'

export function TemplateStudioHeader({
  controller,
  onClose,
}: {
  controller: TemplateStudioController
  onClose: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { molecule, issues, importStructure, save } = controller
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3">
      <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="返回分子编辑器">
        <ArrowLeft size={16} />
      </button>
      <div className="h-5 w-px bg-gray-200" />
      <div className="min-w-0">
        <div className="text-sm font-semibold">模板工作台</div>
        <div className="text-[10px] text-gray-400">创建、导入和维护可复用分子</div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {molecule && <span className="text-[11px] text-gray-400">{getMolecularFormula(molecule.atoms)} · {molecule.atoms.length} 原子 · {molecule.bonds.length} 键</span>}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xyz,.mol,.sdf,chemical/x-xyz,chemical/x-mdl-molfile,chemical/x-mdl-sdfile"
          className="hidden"
          onChange={event => {
            const file = event.target.files?.[0]
            if (file) void importStructure(file).finally(() => { event.target.value = '' })
          }}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900">
          <Upload size={13} />导入结构
        </button>
        <button
          type="button"
          onClick={save}
          title={issues.length > 0 ? `尚有 ${issues.length} 个问题，点击查看原因` : '保存到本地模板库'}
          className={cn('flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90', issues.length > 0 && 'opacity-70')}
        >
          <Save size={13} />保存到模板库
        </button>
      </div>
    </header>
  )
}
