import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, Hexagon, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RuntimeTemplateSite } from '../../application/runtimeTemplateBrush'
import { listCanvasTemplates, RING_FRAGMENTS, type CanvasTemplateSummary } from '../../domain/buildCatalog'
import { WorkspaceSection } from './WorkspacePanelUi'
import { WorkspaceTemplateSiteCanvas } from './WorkspaceTemplateSiteCanvas'

export function TemplateWorkspacePanel({ activeFragmentId, onPickTemplate, onPickFragment, onPickRuntimeSite }: {
  activeFragmentId: string | null
  onPickTemplate: (id: string) => void
  onPickFragment: (id: string) => void
  onPickRuntimeSite: (template: CanvasTemplateSummary, site: RuntimeTemplateSite, flipped: boolean) => boolean
}) {
  const templates = useMemo(() => listCanvasTemplates(), [])
  const workspaceTemplates = templates.filter(template => template.source === 'workspace')
  const builtinTemplates = templates.filter(template => template.source === 'builtin')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [selection, setSelection] = useState<RuntimeTemplateSite | null>(null)
  const [flipped, setFlipped] = useState(false)
  const preview = templates.find(template => template.id === previewId)

  const closePreview = () => {
    setPreviewId(null)
    setSelection(null)
    setFlipped(false)
  }

  if (preview?.molecule) {
    const selectSite = (site: RuntimeTemplateSite) => {
      if (onPickRuntimeSite(preview, site, flipped)) setSelection(site)
    }
    const flip = () => {
      const next = !flipped
      if (!selection || onPickRuntimeSite(preview, selection, next)) setFlipped(next)
    }
    return (
      <div className="space-y-3">
        <button type="button" onClick={closePreview} className="flex h-7 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          <ArrowLeft size={13} />模板资源
        </button>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{preview.name}</div>
            <div className="mt-0.5 font-mono text-[10px] text-slate-500">{preview.formula}</div>
          </div>
          <button
            type="button"
            onClick={() => onPickTemplate(preview.id)}
            title="载入为画布起始结构"
            className="flex h-8 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 text-[10px] font-medium text-slate-700 hover:border-slate-500 hover:text-slate-900"
          >
            <Upload size={12} />起始结构
          </button>
        </div>
        <WorkspaceTemplateSiteCanvas molecule={preview.molecule} selection={selection} flipped={flipped} onSelect={selectSite} onFlip={flip} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
        <div className="text-xs font-semibold text-slate-900">模板库</div>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">环系与完整模板统一从这里进入。打开模板后，在独立 3D 预览中选择原子或边。</p>
      </div>

      <WorkspaceSection title="常用环系" meta={String(RING_FRAGMENTS.length)}>
        <div className="grid grid-cols-2 gap-2">
          {RING_FRAGMENTS.map(fragment => (
            <button
              key={fragment.id}
              type="button"
              onClick={() => onPickFragment(fragment.id)}
              className={cn(
                'flex h-12 min-w-0 items-center gap-2 rounded-md border px-2.5 text-left transition-colors',
                activeFragmentId === fragment.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-100',
              )}
            >
              <Hexagon size={14} className="shrink-0 text-slate-500" />
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-semibold">{fragment.name}</span>
                <span className="block truncate font-mono text-[9px] text-slate-500">{fragment.formula}</span>
              </span>
            </button>
          ))}
        </div>
      </WorkspaceSection>

      {workspaceTemplates.length > 0 && (
        <TemplateSection title="我的模板" templates={workspaceTemplates} onOpen={setPreviewId} />
      )}
      <TemplateSection title="内置分子" templates={builtinTemplates} onOpen={setPreviewId} />
    </div>
  )
}

function TemplateSection({ title, templates, onOpen }: { title: string; templates: readonly CanvasTemplateSummary[]; onOpen: (id: string) => void }) {
  return (
    <WorkspaceSection title={title} meta={String(templates.length)}>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {templates.map((template, index) => (
          <button
            key={template.id}
            type="button"
            title={template.description || template.name}
            onClick={() => onOpen(template.id)}
            className={cn(
              'group flex h-11 w-full min-w-0 items-center gap-2 px-2.5 text-left transition-colors hover:bg-slate-100',
              index > 0 && 'border-t border-slate-200',
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-medium text-slate-800">{template.name}</span>
              <span className="block truncate font-mono text-[9px] text-slate-500">{template.formula}</span>
            </span>
            <span className="text-[9px] text-slate-500 opacity-0 group-hover:opacity-100">选择位点</span>
            <ChevronRight size={13} className="shrink-0 text-slate-600 group-hover:text-slate-700" />
          </button>
        ))}
      </div>
    </WorkspaceSection>
  )
}
