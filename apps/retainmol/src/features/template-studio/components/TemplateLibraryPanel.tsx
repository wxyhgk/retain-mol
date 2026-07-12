import { Database, Trash2 } from 'lucide-react'
import type { TemplateStudioController } from '../model/useTemplateStudioController'

export function TemplateLibraryPanel({ controller }: { controller: TemplateStudioController }) {
  const { savedDrafts, loadDraft, removeDraft } = controller
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <div className="border-b border-gray-200 px-3 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold"><Database size={14} />本地模板库</div>
        <div className="mt-1 text-[10px] text-gray-400">当前设备保存的工作台模板</div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {savedDrafts.length === 0 && <div className="px-2 py-8 text-center text-[11px] leading-5 text-gray-400">暂无模板<br />创建或导入分子后保存</div>}
        {savedDrafts.map(draft => (
          <div key={draft.id} className="group mb-1 flex items-center rounded-md border border-transparent hover:border-gray-200 hover:bg-gray-50">
            <button type="button" onClick={() => loadDraft(draft)} className="min-w-0 flex-1 px-2 py-2 text-left">
              <span className="block truncate text-xs font-medium">{draft.name}</span>
              <span className="block truncate text-[10px] text-gray-400">{draft.molecule.atoms.length} 原子 · {draft.molecule.bonds.length} 键</span>
            </button>
            <button type="button" title="删除模板" onClick={() => removeDraft(draft.id)} className="mr-1 flex h-7 w-7 items-center justify-center rounded text-muted-foreground opacity-0 hover:bg-foreground hover:text-background group-hover:opacity-100">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}
