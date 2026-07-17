import { useState, type ReactNode } from 'react'
import { ArrowLeft, Atom, Download, ExternalLink, Eye, FileOutput } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import {
  ChemStatusHex,
  JobArtifactList,
  JobEmptyState,
  JobParameterList,
  JobSectionHeader,
  JobStatMetrics,
  JobStatusBadge,
  JobThumbnail,
  WorkbenchTaskList,
} from '@retainmol/jobs'
import { WorkflowReadOnlyCanvas } from '@/features/workflows'
import { MOCK_GRAPH, MOCK_JOBS, MOCK_JOB_DETAIL } from '../mockJobs'

interface GallerySection {
  /** 组件名(与代码一致,方便全局搜索)。 */
  name: string
  /** 导入路径。 */
  importPath: string
  /** 一句话说明。 */
  description: string
  /** 关系信息:[标签, 内容],如 ['数据', 'props 注入']、['用于', '工作台左栏']。 */
  relations: Array<readonly [string, string]>
  demo: ReactNode
}

function Section({ name, importPath, description, relations, demo }: GallerySection) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <header className="border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 className="font-mono text-sm font-semibold">{name}</h2>
          <code className="text-[10px] text-muted-foreground">{importPath}</code>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {relations.map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-1.5 text-[11px]">
              <dt className="shrink-0 font-medium text-muted-foreground">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </header>
      <div className="bg-background p-4">{demo}</div>
    </section>
  )
}

const noop = () => {}

function TaskListDemo() {
  const [selected, setSelected] = useState<string | null>(MOCK_JOBS[0].id)
  return (
    <div className="h-[420px] max-w-sm overflow-hidden rounded-lg border border-border">
      <WorkbenchTaskList
        jobs={MOCK_JOBS}
        isLoading={false}
        selectedJobId={selected}
        onSelectJob={setSelected}
        onOpenEditor={noop}
      />
    </div>
  )
}

function GraphCanvasDemo() {
  const [selected, setSelected] = useState<string | null>('mock-ts-refine')
  return (
    <div className="h-[420px] overflow-hidden rounded-lg border border-border">
      <WorkflowReadOnlyCanvas graph={MOCK_GRAPH} selectedJobId={selected} onSelectJob={setSelected} />
    </div>
  )
}

const artifactActions = () => (
  <>
    <Button variant="outline" size="sm"><Atom />打开结构</Button>
    <Button variant="ghost" size="icon" className="size-8" title="预览产物"><Eye /></Button>
    <Button variant="ghost" size="icon" className="size-8" title="下载产物"><Download /><ExternalLink className="sr-only" /></Button>
  </>
)

const SECTIONS: GallerySection[] = [
  {
    name: 'JobStatusBadge',
    importPath: '@retainmol/jobs → components/JobStatusBadge',
    description: '任务状态徽章,全部 7 种状态的词汇与配色都从这里出。',
    relations: [
      ['依赖', '@retainmol/ui-kit (cn)'],
      ['数据', 'props: status'],
      ['用于', '任务卡、详情页头、平台列表'],
    ],
    demo: (
      <div className="flex flex-wrap gap-2">
        {(['created', 'queued', 'running', 'succeeded', 'failed', 'cancelled', 'interrupted'] as const).map(status => (
          <JobStatusBadge key={status} status={status} />
        ))}
      </div>
    ),
  },
  {
    name: 'ChemStatusHex',
    importPath: '@retainmol/jobs → components/workbench/ChemStatusHex',
    description: '苯环六边形状态标:化学风格的状态指示;反应中=teal、异常=rose、完成=emerald、未开始=slate。',
    relations: [
      ['依赖', '@retainmol/ui-kit、lucide-react'],
      ['数据', 'props: status / size'],
      ['用于', '任务卡、依赖图节点(替代此处的 JobStatusBadge)'],
    ],
    demo: (
      <div className="flex flex-wrap items-center gap-3">
        {(['created', 'queued', 'running', 'succeeded', 'failed', 'cancelled', 'interrupted'] as const).map(status => (
          <span key={status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ChemStatusHex status={status} />
            {status}
          </span>
        ))}
      </div>
    ),
  },
  {
    name: 'JobThumbnail',
    importPath: '@retainmol/jobs → components/shared/JobThumbnail',
    description: '任务缩略图:有 preview 产物显示截图,否则占位图标。当前占位样式是主要美化点。',
    relations: [
      ['依赖', '@retainmol/ui-kit、lucide-react'],
      ['数据', 'props: job.artifacts(preview/png)'],
      ['用于', '任务卡、平台列表'],
    ],
    demo: (
      <div className="flex items-end gap-4">
        <div className="text-center"><JobThumbnail job={{}} size="sm" /><p className="mt-1 text-[10px] text-muted-foreground">sm 占位</p></div>
        <div className="text-center"><JobThumbnail job={{}} size="lg" /><p className="mt-1 text-[10px] text-muted-foreground">lg 占位</p></div>
      </div>
    ),
  },
  {
    name: 'WorkbenchTaskList',
    importPath: '@retainmol/jobs → components/workbench/WorkbenchTaskList',
    description: '工作台左栏:搜索 + 状态 chips + 任务卡列表。卡片内部结构是分子卡片的主战场。',
    relations: [
      ['依赖', 'JobThumbnail、JobStatusBadge、jobFilter'],
      ['数据', 'props: jobs(无后端);选中经 onSelectJob 上抛'],
      ['用于', 'JobWorkbench 左栏'],
    ],
    demo: <TaskListDemo />,
  },
  {
    name: 'WorkflowReadOnlyCanvas',
    importPath: '@/features/workflows → components/WorkflowReadOnlyCanvas',
    description: '中栏只读依赖图:React Flow + dagre 布局;化学键边(氢键虚线/电子流动)+ 苯环底纹,Graph|Stack 双视图。',
    relations: [
      ['依赖', '@xyflow/react(adapter 内)、@dagrejs/dagre、lucide-react'],
      ['数据', 'props: WorkbenchGraphData(宿主投影 workflow 引用)'],
      ['用于', 'JobWorkbench 中栏(renderGraph 注入)'],
    ],
    demo: <GraphCanvasDemo />,
  },
  {
    name: 'JobParameterList',
    importPath: '@retainmol/jobs → components/shared/JobParameterList',
    description: '计算参数 cells 网格;行内容来自 domain/jobPresentation.jobParameterRows。',
    relations: [
      ['依赖', 'DataCell、jobParameterRows'],
      ['数据', 'props: job(含 request)'],
      ['用于', '详情 Details 面板'],
    ],
    demo: (
      <div className="max-w-xl border border-border">
        <JobParameterList job={MOCK_JOB_DETAIL} layout="cells" />
      </div>
    ),
  },
  {
    name: 'JobArtifactList',
    importPath: '@retainmol/jobs → components/shared/JobArtifactList',
    description: '产物列表(输入/输出),行尾动作槽由调用方渲染。',
    relations: [
      ['依赖', 'JobSectionHeader'],
      ['数据', 'props: artifacts + renderActions 插槽'],
      ['用于', '详情 Files/Outputs 面板'],
    ],
    demo: (
      <JobArtifactList
        title="输出产物"
        icon={FileOutput}
        artifacts={(MOCK_JOB_DETAIL.artifacts ?? []).filter(item => item.role === 'output')}
        renderActions={artifactActions}
      />
    ),
  },
  {
    name: 'JobSectionHeader',
    importPath: '@retainmol/jobs → components/shared/JobSectionHeader',
    description: '分区头:图标 + 标题 + 副标题,详情面板各卡片的统一头部。',
    relations: [
      ['依赖', 'lucide-react'],
      ['数据', 'props: icon/title/subtitle'],
      ['用于', '计算定义、执行状态、产物列表'],
    ],
    demo: (
      <div className="max-w-xl border border-border">
        <JobSectionHeader icon={Atom} title="计算定义" subtitle="创建任务时冻结的参数" />
      </div>
    ),
  },
  {
    name: 'JobStatMetrics',
    importPath: '@retainmol/jobs → components/shared/JobStatMetrics',
    description: '四格统计块(旧任务中心头部),工作台已用 chips 取代;保留作对照。',
    relations: [
      ['依赖', 'countJobsByBucket'],
      ['数据', 'props: jobs + activeBucket'],
      ['用于', '(旧)PlatformJobList、PlatformDashboard'],
    ],
    demo: <JobStatMetrics jobs={MOCK_JOBS} activeBucket="all" onSelectBucket={noop} />,
  },
  {
    name: 'JobEmptyState',
    importPath: '@retainmol/jobs → components/shared/JobEmptyState',
    description: '空状态占位:列表无数据、无选中时使用。',
    relations: [
      ['依赖', '@retainmol/ui-kit (cn)'],
      ['数据', 'props: title/description'],
      ['用于', '各列表与面板空态'],
    ],
    demo: <JobEmptyState title="没有符合条件的任务" className="border border-dashed border-border py-10" />,
  },
]

export function ComponentGalleryPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />返回任务中心
      </button>
      <header className="mb-6">
        <h1 className="text-xl font-semibold">组件展示台</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          开发专用页(/lab/components):组件从上到下排列,标注名称、导入路径与依赖/数据/用途关系。
          新组件在 ComponentGalleryPage 的 SECTIONS 里加一节即可;只收「数据从 props 进」的展示组件,容器组件直接在工作台验证。
        </p>
      </header>
      <div className="space-y-6 pb-16">
        {SECTIONS.map(section => <Section key={section.name} {...section} />)}
      </div>
    </div>
  )
}
