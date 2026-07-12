import * as THREE from 'three'
import { SKETCH_GRID } from '../../config/render.config'
import { addBackgroundGrid } from './sceneRig'
import { disposeObject3D } from './disposeObject3D'

const VIEWPORT_AXES_SIZE = 4

export type SketchPlane = {
  origin: [number, number, number]
  normal: [number, number, number]
}

/** Owns non-molecular viewport helpers and their GPU resources. */
export class ViewportGuides {
  private backgroundGrid: THREE.GridHelper | null
  private axesHelper: THREE.AxesHelper | null
  private sketchGrid: THREE.GridHelper | null = null
  private gridVisibleOverride: boolean | null = null

  constructor(
    private readonly scene: THREE.Scene,
    private readonly modelGroup: THREE.Group,
    private readonly invalidate: () => void,
  ) {
    this.backgroundGrid = addBackgroundGrid(scene)
    this.axesHelper = new THREE.AxesHelper(VIEWPORT_AXES_SIZE)
    this.axesHelper.visible = false
    scene.add(this.axesHelper)
  }

  setSketchPlane(plane: SketchPlane | null) {
    this.disposeSketchGrid()
    if (plane) {
      const config = SKETCH_GRID
      const grid = new THREE.GridHelper(
        config.size,
        config.divisions,
        config.color,
        config.subColor,
      )
      const material = grid.material as THREE.LineBasicMaterial | THREE.LineBasicMaterial[]
      for (const item of Array.isArray(material) ? material : [material]) {
        item.transparent = true
        item.opacity = config.opacity
        item.depthWrite = false
      }
      grid.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(...plane.normal).normalize(),
      )
      grid.position.set(...plane.origin)
      this.modelGroup.add(grid)
      this.sketchGrid = grid
    }
    this.invalidate()
  }

  syncGridVisibility(profileVisible: boolean) {
    if (this.backgroundGrid) {
      this.backgroundGrid.visible = this.gridVisibleOverride ?? profileVisible
    }
  }

  setAxesVisible(visible: boolean) {
    if (this.axesHelper) this.axesHelper.visible = visible
    this.invalidate()
  }

  setGridVisible(visible: boolean) {
    this.gridVisibleOverride = visible
    if (this.backgroundGrid) this.backgroundGrid.visible = visible
    this.invalidate()
  }

  dispose() {
    this.disposeSketchGrid()
    if (this.backgroundGrid) {
      this.scene.remove(this.backgroundGrid)
      disposeObject3D(this.backgroundGrid)
      this.backgroundGrid = null
    }
    if (this.axesHelper) {
      this.scene.remove(this.axesHelper)
      disposeObject3D(this.axesHelper)
      this.axesHelper = null
    }
  }

  private disposeSketchGrid() {
    if (!this.sketchGrid) return
    this.modelGroup.remove(this.sketchGrid)
    disposeObject3D(this.sketchGrid)
    this.sketchGrid = null
  }
}
