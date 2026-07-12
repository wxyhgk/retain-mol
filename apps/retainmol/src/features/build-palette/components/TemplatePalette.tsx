import { useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft, ChevronRight, FlaskConical, Hexagon, Library, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RuntimeTemplateSite } from '../application/runtimeTemplateBrush'
import { listCanvasTemplates, RING_FRAGMENTS, type CanvasTemplateSummary } from '../domain/buildCatalog'
import { TemplateSitePicker } from './TemplateSitePicker'

export function TemplatePalette({ activeFragmentId, onPickTemplate, onPickFragment, onPickRuntimeSite }: {
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

  const openPreview = (id: string) => {
    setPreviewId(id)
    setSelection(null)
    setFlipped(false)
  }

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
        <button
          type="button"
          onClick={closePreview}
          className="flex h-7 items-center gap-1 rounded px-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft size={13} />
          模板资源
        </button>

        <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">{preview.name}</div>
            <div className="mt-0.5 font-mono text-[10px] text-gray-500">{preview.formula}</div>
          </div>
          <button
            type="button"
            onClick={() => onPickTemplate(preview.id)}
            title="将完整模板载入为空画布的起始结构"
            className="flex h-7 shrink-0 items-center gap-1 rounded border border-gray-300 bg-white px-2 text-[10px] font-medium text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
          >
            <Upload size={12} />
            载入起始结构
          </button>
        </div>

        <TemplateSitePicker molecule={preview.molecule} selection={selection} flipped={flipped} onSelect={selectSite} onFlip={flip} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <div className="text-xs font-semibold text-gray-900">模板资源</div>
        <div className="mt-1 text-[10px] leading-4 text-gray-500">选择分子模板并预览连接位点，或直接启用常用环系。</div>
      </div>

      <ResourceSection icon={<Hexagon size={13} />} title="快速环系" count={RING_FRAGMENTS.length}>
        <div className="grid grid-cols-2 gap-1.5">
          {RING_FRAGMENTS.map(fragment => (
            <button
              key={fragment.id}
              type="button"
              title={fragment.name}
              onClick={() => onPickFragment(fragment.id)}
              className={cn(
                'flex h-12 min-w-0 items-center justify-between rounded border px-2.5 text-left transition-colors',
                activeFragmentId === fragment.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50',
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-semibold">{fragment.name}</span>
                <span className={cn('block font-mono text-[9px]', activeFragmentId === fragment.id ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{fragment.formula}</span>
              </span>
              {activeFragmentId === fragment.id && <span className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground" />}
            </button>
          ))}
        </div>
      </ResourceSection>

      {workspaceTemplates.length > 0 && (
        <ResourceSection icon={<Library size={13} />} title="我的模板" count={workspaceTemplates.length}>
          <TemplateList templates={workspaceTemplates} onOpen={openPreview} />
        </ResourceSection>
      )}

      <ResourceSection icon={<FlaskConical size={13} />} title="内置分子" count={builtinTemplates.length}>
        <TemplateList templates={builtinTemplates} onOpen={openPreview} />
      </ResourceSection>
    </div>
  )
}

function ResourceSection({ icon, title, count, children }: { icon: ReactNode; title: string; count: number; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5 text-gray-600">
        {icon}
        <h3 className="text-[10px] font-semibold uppercase">{title}</h3>
        <span className="ml-auto font-mono text-[9px] text-gray-400">{count}</span>
      </div>
      {children}
    </section>
  )
}

function TemplateList({ templates, onOpen }: { templates: CanvasTemplateSummary[]; onOpen: (id: string) => void }) {
  return (
    <div className="divide-y divide-gray-100 border-y border-gray-200">
      {templates.map(template => (
        <button
          key={template.id}
          type="button"
          title={template.description || template.name}
          onClick={() => onOpen(template.id)}
          className="group flex h-11 w-full min-w-0 items-center gap-2 px-1.5 text-left transition-colors hover:bg-gray-50"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-medium text-gray-800">{template.name}</span>
            <span className="block truncate font-mono text-[9px] text-gray-400">{template.formula}</span>
          </span>
          <span className="text-[9px] text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">预览</span>
          <ChevronRight size={13} className="shrink-0 text-gray-300 group-hover:text-gray-600" />
        </button>
      ))}
    </div>
  )
}
