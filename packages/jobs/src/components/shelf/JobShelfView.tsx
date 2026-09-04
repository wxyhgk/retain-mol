import { useCallback, useEffect, useMemo, useRef } from 'react'
import { resolveTheme, type ResolvedTheme } from '@retainmol/mol-viewer/styles'
import { useUiThemeStore } from '@retainmol/ui-kit'
import type { JobSummary } from '../../domain/jobTypes'
import type { ShelfMoleculeEntry } from '../../domain/shelf/jobMolecule'
import type { WorkflowNodeVisualState } from '../../domain/shelf/shelfNodeStyle'
import { clampScroll, shelfRowCount } from '../../domain/shelf/shelfLayout'
import { ROW_SCREEN_FACTOR, WORLD_PER_PX, visibleRowsForHeight } from './scene/shelfCamera'
import { ShelfSceneManager, type ShelfSyncEntry } from './scene/ShelfSceneManager'
import type { ShelfEdgeInput } from './scene/ShelfEdge'
import { ShelfOverlay } from './ShelfOverlay'

const DRAG_THRESHOLD_PX = 4
const NO_EDGES: ShelfEdgeInput[] = []

export interface JobShelfViewProps {
  jobs: readonly JobSummary[]
  molecules: Map<string, ShelfMoleculeEntry>
  onOpenJob: (jobId: string) => void
  onRunJob: (jobId: string) => void
  runPendingJobId: string | null
  /** 工作流节点运行时状态（存在时覆盖任务状态的材质与展签徽章） */
  nodeStates?: Map<string, WorkflowNodeVisualState>
  /** 盒子之间的依赖管道 */
  edges?: readonly ShelfEdgeInput[]
  /** Molecule rendering theme supplied by the host; platform pages default to CPK. */
  moleculeThemeId?: string
}

function safeResolveTheme(themeId: string): ResolvedTheme {
  try {
    return resolveTheme(themeId)
  } catch {
    return resolveTheme('default')
  }
}

export function JobShelfView({
  jobs,
  molecules,
  onOpenJob,
  onRunJob,
  runPendingJobId,
  nodeStates,
  edges = NO_EDGES,
  moleculeThemeId = 'default',
}: JobShelfViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const managerRef = useRef<ShelfSceneManager | null>(null)
  const scrollRef = useRef(0)
  const sizeRef = useRef({ width: 1, height: 1 })
  const cardsRef = useRef(new Map<string, HTMLDivElement>())

  const uiTheme = useUiThemeStore(state => state.theme)
  const molTheme = useMemo(() => safeResolveTheme(moleculeThemeId), [moleculeThemeId])
  const molThemeRef = useRef(molTheme)

  const entries = useMemo<ShelfSyncEntry[]>(
    () => jobs.map(job => {
      const nodeState = nodeStates?.get(job.id)
      return {
        jobId: job.id,
        status: job.status,
        entry: molecules.get(job.id) ?? { state: 'loading' },
        ...(nodeState !== undefined ? { nodeState } : {}),
      }
    }),
    [jobs, molecules, nodeStates],
  )
  const entriesRef = useRef(entries)
  const openJobRef = useRef(onOpenJob)
  useEffect(() => {
    openJobRef.current = onOpenJob
  }, [onOpenJob])

  const registerCard = useCallback((jobId: string, element: HTMLDivElement | null) => {
    if (element) cardsRef.current.set(jobId, element)
    else cardsRef.current.delete(jobId)
  }, [])

  // 挂载：manager + resize/可见性观察 + rAF 循环（分子常转、视差阻尼，可见即跑）
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const manager = new ShelfSceneManager(canvas)
    managerRef.current = manager

    // 展签逐帧贴盒：绕开 React，直接写 transform
    const applyAnchors = () => {
      const anchors = manager.projectAnchors()
      for (const [jobId, element] of cardsRef.current) {
        const point = anchors.get(jobId)
        if (point) {
          element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translateX(-50%)`
          element.style.visibility = 'visible'
        } else {
          element.style.visibility = 'hidden'
        }
      }
    }

    const applySize = () => {
      const rect = container.getBoundingClientRect()
      sizeRef.current = { width: rect.width, height: rect.height }
      manager.setSize(rect.width, rect.height)
      manager.renderOnce()
      applyAnchors()
    }
    applySize()
    const resizeObserver = new ResizeObserver(applySize)
    resizeObserver.observe(container)

    let rafId = 0
    let inViewport = true
    // 初始一律按可见处理：嵌入式/无头环境可能误报 document.hidden 且
    // visibilitychange 不再触发；页面真隐藏时浏览器自会节流 rAF。
    let pageVisible = true
    let running = false
    const tick = () => {
      manager.frame()
      applyAnchors()
      rafId = requestAnimationFrame(tick)
    }
    const updateLoop = () => {
      const shouldRun = inViewport && pageVisible
      if (shouldRun && !running) {
        running = true
        rafId = requestAnimationFrame(tick)
      } else if (!shouldRun && running) {
        running = false
        cancelAnimationFrame(rafId)
      }
    }
    const intersection = new IntersectionObserver(records => {
      inViewport = records.at(0)?.isIntersecting ?? true
      updateLoop()
    })
    intersection.observe(container)
    const onVisibility = () => {
      pageVisible = !document.hidden
      updateLoop()
    }
    document.addEventListener('visibilitychange', onVisibility)
    updateLoop()

    // 非 passive wheel：内容超出一屏才接管滚动
    const onWheel = (event: WheelEvent) => {
      const columns = manager.columns
      const rows = shelfRowCount(entriesRef.current.length, columns)
      const visibleRows = visibleRowsForHeight(sizeRef.current.height)
      if (rows <= visibleRows) return
      event.preventDefault()
      const deltaWorld = (event.deltaY * WORLD_PER_PX) / ROW_SCREEN_FACTOR
      scrollRef.current = clampScroll(scrollRef.current + deltaWorld, rows, visibleRows)
      manager.setScroll(scrollRef.current)
      applyAnchors()
    }
    container.addEventListener('wheel', onWheel, { passive: false })

    // 指针：悬停盒子自身 tilt（相机固定，背景不动）+ 带拖拽阈值的点击
    let downAt: { x: number; y: number } | null = null
    const onPointerMove = (event: PointerEvent) => {
      manager.setPointer(event.clientX, event.clientY)
    }
    const onPointerDown = (event: PointerEvent) => {
      downAt = { x: event.clientX, y: event.clientY }
    }
    const onPointerUp = (event: PointerEvent) => {
      const start = downAt
      downAt = null
      if (!start) return
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRAG_THRESHOLD_PX) return
      const jobId = manager.pick(event.clientX, event.clientY)
      if (jobId) openJobRef.current(jobId)
    }
    const onPointerLeave = () => {
      manager.setHover(null)
    }
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerLeave)

    return () => {
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      container.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      if (running) cancelAnimationFrame(rafId)
      manager.dispose()
      managerRef.current = null
    }
  }, [])

  // 数据/主题同步 + 滚动重新夹取
  useEffect(() => {
    entriesRef.current = entries
    molThemeRef.current = molTheme
    const manager = managerRef.current
    if (!manager) return
    manager.syncJobs(entries, uiTheme, () => molThemeRef.current)
    manager.syncEdges(edges)
    const rows = shelfRowCount(entries.length, manager.columns)
    scrollRef.current = clampScroll(scrollRef.current, rows, visibleRowsForHeight(sizeRef.current.height))
    manager.setScroll(scrollRef.current)
    // 兜底一帧：即使动画循环被可见性判定挡住，数据变化也立即可见
    manager.renderOnce()
  }, [entries, uiTheme, molTheme, edges])

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
      <ShelfOverlay
        jobs={jobs}
        molecules={molecules}
        registerCard={registerCard}
        onOpenJob={onOpenJob}
        onRunJob={onRunJob}
        runPendingJobId={runPendingJobId}
        {...(nodeStates ? { nodeStates } : {})}
      />
    </div>
  )
}
