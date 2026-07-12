import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { TemplateDraftCategory } from '@retainmol/mol-viewer/templates'
import { cn } from '@/lib/utils'
import type { TemplateStudioController } from '../model/useTemplateStudioController'

const CATEGORY_OPTIONS: { value: TemplateDraftCategory; label: string }[] = [
  { value: 'fragment', label: '片段' },
  { value: 'ring', label: '环系' },
  { value: 'functional-group', label: '官能团' },
  { value: 'molecule', label: '完整分子' },
]

const FIELD_CLASS = 'h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-[11px] text-gray-700 outline-none transition-colors focus:border-gray-400'

export function TemplateInspectorPanel({ controller }: { controller: TemplateStudioController }) {
  const { name, setName, templateId, setTemplateId, category, setCategory, description, setDescription, tags, setTags, issues, notice } = controller
  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-gray-200 bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="space-y-2 border-b border-gray-200 p-3">
          <SectionTitle>模板信息</SectionTitle>
          <Field label="名称"><input value={name} onChange={event => setName(event.target.value)} className={FIELD_CLASS} /></Field>
          <Field label="模板 ID"><input value={templateId} onChange={event => setTemplateId(event.target.value)} className={cn(FIELD_CLASS, 'font-mono')} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="类别"><select value={category} onChange={event => setCategory(event.target.value as TemplateDraftCategory)} className={FIELD_CLASS}>{CATEGORY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
            <Field label="标签"><input value={tags} onChange={event => setTags(event.target.value)} placeholder="芳香, 稠环" className={FIELD_CLASS} /></Field>
          </div>
          <Field label="说明"><textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} className={cn(FIELD_CLASS, 'h-auto resize-none py-2')} /></Field>
        </section>
        <section className="space-y-2 p-3">
          <SectionTitle>保存校验</SectionTitle>
          {issues.length === 0
            ? <div className="flex items-center gap-2 rounded-md border border-foreground bg-foreground px-2.5 py-2 text-[11px] text-background"><CheckCircle2 size={14} />可以保存到模板库</div>
            : <div className="space-y-1">{issues.map(issue => <div key={`${issue.code}-${issue.path}`} className="flex gap-2 rounded-md border border-border bg-muted px-2.5 py-2 text-[10px] leading-4 text-foreground"><AlertTriangle size={12} className="mt-0.5 shrink-0" />{issue.message}</div>)}</div>}
          <p className="text-[10px] leading-4 text-gray-400">连接原子或并环边会在使用模板时选择，不写入模板文件。</p>
        </section>
      </div>
      {notice && <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-[10px] text-gray-600">{notice}</div>}
    </aside>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) { return <div className="text-[10px] font-semibold uppercase text-gray-400">{children}</div> }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-1"><span className="text-[10px] font-medium text-gray-500">{label}</span>{children}</label> }
