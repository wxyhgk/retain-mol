import * as THREE from 'three'
import { AromaticRingCache, type ResolvedTheme } from '@retainmol/mol-viewer/three'
import type { JobStatus } from '../../../domain/jobTypes'
import type { ShelfMoleculeEntry } from '../../../domain/shelf/jobMolecule'
import { SHELF, layoutShelf, shelfColumns } from '../../../domain/shelf/shelfLayout'
import { shelfStatusStyle, type ShelfUiTheme } from '../../../domain/shelf/shelfStatusStyle'
import { shelfNodeStatusStyle, type WorkflowNodeVisualState } from '../../../domain/shelf/shelfNodeStyle'
import { ShelfEdge, createEdgeDashTexture, type ShelfEdgeInput } from './ShelfEdge'
import {
  GlassBox,
  createSharedShelfGeometries,
  disposeSharedShelfGeometries,
  type SharedShelfGeometries,
} from './GlassBox'
import {
  SCREEN_RIGHT_AXIS,
  WORLD_PER_PX,
  createShelfCamera,
  initialRowOffset,
  updateShelfCamera,
  worldToScreen,
} from './shelfCamera'

/** 盒子屏幕半宽近似（corner-on 投影 ~1.4 倍边长），用于把指针位置归一化成 tilt 偏移。 */
const BOX_SCREEN_HALF_PX = (SHELF.boxSize * 1.4) / 2 / WORLD_PER_PX

const pointerWorld = new THREE.Vector3()

export interface ShelfSyncEntry {
  jobId: string
  status: JobStatus
  entry: ShelfMoleculeEntry
  /** 工作流节点运行时状态：存在时覆盖 status 的材质语言。 */
  nodeState?: WorkflowNodeVisualState
}

/** 单 canvas 单场景：持有 renderer/相机/灯光/共享几何，diff 式同步 GlassBox（模式照 MoleculeSceneLayer）。 */
export class ShelfSceneManager {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly shelfRoot = new THREE.Group()
  private readonly boxes = new Map<string, GlassBox>()
  private readonly edges = new Map<string, ShelfEdge>()
  private readonly edgeDashTexture = createEdgeDashTexture()
  private readonly shared: SharedShelfGeometries
  private readonly aromaticCache = new AromaticRingCache()
  private readonly raycaster = new THREE.Raycaster()
  private readonly clock = new THREE.Clock()

  private widthPx = 1
  private heightPx = 1
  private scrollOffset = 0
  private hoveredJobId: string | null = null
  private orderedJobIds: string[] = []
  private uiTheme: ShelfUiTheme = 'day'
  private getMolTheme: () => ResolvedTheme = () => {
    throw new Error('syncJobs must run before molecules render')
  }

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.camera = createShelfCamera(1, 1)

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.9))
    const key = new THREE.DirectionalLight(0xffffff, 1.8)
    key.position.set(4, 8, 6)
    const fill = new THREE.DirectionalLight(0xffffff, 0.5)
    fill.position.set(-6, 4, -4)
    this.scene.add(key, fill)

    // 墙面式：盒子世界轴对齐（45° 方位角相机看到 corner-on 立方体），根组不旋转
    this.scene.add(this.shelfRoot)

    this.shared = createSharedShelfGeometries()
  }

  get columns(): number {
    return shelfColumns(this.widthPx)
  }

  setSize(widthPx: number, heightPx: number): void {
    this.widthPx = Math.max(1, widthPx)
    this.heightPx = Math.max(1, heightPx)
    this.renderer.setSize(this.widthPx, this.heightPx, false)
    // 相机固定：背景盒子永不因指针移动而动，交互响应全在被悬停的盒子自身
    updateShelfCamera(this.camera, this.widthPx, this.heightPx, 0, 0)
    this.applyLayout()
    this.applyScroll()
  }

  /** 指针位置 → 悬停盒子的 tilt 偏移；只影响被指的那个盒子。 */
  setPointer(clientX: number, clientY: number): void {
    const jobId = this.pick(clientX, clientY)
    this.setHover(jobId)
    if (!jobId) return
    const box = this.boxes.get(jobId)
    if (!box) return
    const rect = this.canvas.getBoundingClientRect()
    box.group.getWorldPosition(pointerWorld)
    const center = worldToScreen(pointerWorld, this.camera, this.widthPx, this.heightPx)
    box.setTilt(
      (clientX - rect.left - center.x) / BOX_SCREEN_HALF_PX,
      (clientY - rect.top - center.y) / BOX_SCREEN_HALF_PX,
    )
  }

  syncJobs(entries: readonly ShelfSyncEntry[], uiTheme: ShelfUiTheme, getMolTheme: () => ResolvedTheme): void {
    this.getMolTheme = getMolTheme
    this.uiTheme = uiTheme
    const seen = new Set<string>()
    for (const { jobId, status, entry, nodeState } of entries) {
      seen.add(jobId)
      let box = this.boxes.get(jobId)
      if (!box) {
        box = new GlassBox(jobId, this.shared, () => this.getMolTheme(), this.aromaticCache)
        this.boxes.set(jobId, box)
        this.shelfRoot.add(box.group)
      }
      box.applyStyle(nodeState ? shelfNodeStatusStyle(nodeState, uiTheme) : shelfStatusStyle(status, uiTheme))
      box.setMolecule(entry.state === 'ready' ? entry.molecule : null)
    }
    for (const [jobId, box] of this.boxes) {
      if (!seen.has(jobId)) {
        box.dispose()
        this.boxes.delete(jobId)
      }
    }
    this.orderedJobIds = entries.map(item => item.jobId)
    this.applyLayout()
  }

  /** diff 式同步依赖管道；曲线端点取自两端盒子的当前布局位置。 */
  syncEdges(inputs: readonly ShelfEdgeInput[]): void {
    const seen = new Set<string>()
    for (const input of inputs) {
      seen.add(input.id)
      let edge = this.edges.get(input.id)
      if (!edge) {
        edge = new ShelfEdge(input.id, input.sourceJobId, input.targetJobId, this.edgeDashTexture)
        this.edges.set(input.id, edge)
        this.shelfRoot.add(edge.mesh)
      }
      edge.applyState(input.state, this.uiTheme)
    }
    for (const [id, edge] of this.edges) {
      if (!seen.has(id)) {
        edge.dispose()
        this.edges.delete(id)
      }
    }
    this.rebuildEdgeCurves()
  }

  private rebuildEdgeCurves(): void {
    for (const edge of this.edges.values()) {
      const source = this.boxes.get(edge.sourceJobId)
      const target = this.boxes.get(edge.targetJobId)
      if (!source || !target) {
        edge.mesh.visible = false
        continue
      }
      edge.mesh.visible = true
      edge.updateCurve(
        new THREE.Vector3(source.group.position.x, source.slotY, source.group.position.z),
        new THREE.Vector3(target.group.position.x, target.slotY, target.group.position.z),
      )
    }
  }

  private applyLayout(): void {
    for (const slot of layoutShelf(this.orderedJobIds, this.columns)) {
      // 列偏移沿屏幕水平轴展开到世界 XZ，行偏移直接落在世界 Y
      this.boxes.get(slot.jobId)?.setSlot(
        SCREEN_RIGHT_AXIS.x * slot.x,
        slot.y,
        SCREEN_RIGHT_AXIS.z * slot.x,
      )
    }
    this.rebuildEdgeCurves()
  }

  /** offset 已由宿主 clamp（domain clampScroll）。 */
  setScroll(offsetWorld: number): void {
    this.scrollOffset = offsetWorld
    this.applyScroll()
  }

  private applyScroll(): void {
    // 行沿世界 -Y 向下；根组沿 +Y 上移 = 内容上移。
    // shift = 首行锚到视口上沿的偏移 + 用户滚动量。
    this.shelfRoot.position.set(0, initialRowOffset(this.heightPx) + this.scrollOffset, 0)
  }

  setHover(jobId: string | null): void {
    if (jobId === this.hoveredJobId) return
    if (this.hoveredJobId) this.boxes.get(this.hoveredJobId)?.setHovered(false)
    this.hoveredJobId = jobId
    if (jobId) this.boxes.get(jobId)?.setHovered(true)
    this.canvas.style.cursor = jobId ? 'pointer' : 'default'
  }

  pick(clientX: number, clientY: number): string | null {
    const rect = this.canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    this.raycaster.setFromCamera(ndc, this.camera)
    const targets = [...this.boxes.values()].map(box => box.raycastTarget)
    const hit = this.raycaster.intersectObjects(targets, false).at(0)
    return hit ? (hit.object.userData as { jobId?: string }).jobId ?? null : null
  }

  /** 每盒 overlay 锚点（盒子正下方），屏幕外的盒子被剔除。 */
  projectAnchors(): Map<string, { x: number; y: number }> {
    this.shelfRoot.updateMatrixWorld()
    const anchors = new Map<string, { x: number; y: number }>()
    const world = new THREE.Vector3()
    const margin = 120
    for (const [jobId, box] of this.boxes) {
      // 锚点用 slot 基准位（不含 hover 抬升/tilt），展签保持安静不跟着晃
      world.set(box.group.position.x, box.slotY, box.group.position.z).applyMatrix4(this.shelfRoot.matrixWorld)
      // corner-on 时前角低于盒底面，展签锚得更低才不压住盒子
      world.y -= SHELF.boxSize / 2 + 0.55
      const point = worldToScreen(world, this.camera, this.widthPx, this.heightPx)
      if (point.x < -margin || point.x > this.widthPx + margin || point.y < -margin || point.y > this.heightPx + margin) continue
      anchors.set(jobId, point)
    }
    return anchors
  }

  frame(): void {
    const delta = this.clock.getDelta()
    const elapsed = this.clock.elapsedTime
    for (const box of this.boxes.values()) box.frame(elapsed, delta)
    for (const edge of this.edges.values()) edge.frame(delta)
    this.renderer.render(this.scene, this.camera)
  }

  renderOnce(): void {
    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    for (const box of this.boxes.values()) box.dispose()
    this.boxes.clear()
    for (const edge of this.edges.values()) edge.dispose()
    this.edges.clear()
    this.edgeDashTexture.dispose()
    disposeSharedShelfGeometries(this.shared)
    this.renderer.dispose()
  }
}
