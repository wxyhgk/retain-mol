import * as THREE from 'three'
import type { Atom } from '../molecule'
import type { MeasureStyle, MeasureType } from '../presentation/types'
import { DEFAULT_MEASURE_STYLE } from '../presentation/types'
import type { ResolvedTheme } from '../../presets'
import { getElementData } from '../model/elements'
import { RENDER } from '../../config/render.config'
import { disposeObject3D } from './disposeObject3D'
import { MeasurePrimitiveFactory } from './MeasurePrimitiveFactory'
import { MeasurementVisualBuilder, type MeasureLabel } from './MeasurementVisualBuilder'

/** Owns measurement visual lifecycle and delegates geometry creation. */
export class MeasureVisuals {
  measureStyle: MeasureStyle = DEFAULT_MEASURE_STYLE
  measureLabelPositions: MeasureLabel[] = []
  private readonly primitives: MeasurePrimitiveFactory
  private readonly builder: MeasurementVisualBuilder

  constructor(
    private readonly measureGroup: THREE.Group,
    canvas: HTMLCanvasElement,
    private readonly getTheme: () => ResolvedTheme,
  ) {
    this.primitives = new MeasurePrimitiveFactory(measureGroup, canvas)
    this.builder = new MeasurementVisualBuilder(this.primitives)
  }

  update(
    committed: Array<{ type: MeasureType; atoms: Atom[] }>,
    pending: Atom[],
  ) {
    this.clearVisuals()
    for (const measurement of committed) {
      this.addMeasurement(measurement.type, measurement.atoms)
    }

    for (const atom of pending) {
      const atomRadius = getElementData(atom.symbol).covalentRadius * this.getTheme().render.ballScale
      this.primitives.addPendingHalo(
        new THREE.Vector3(atom.x, atom.y, atom.z),
        atomRadius + RENDER.pendingHaloOffset,
        this.measureStyle.lineColor,
      )
    }

    if (pending.length >= 2) {
      const type: MeasureType = pending.length === 2
        ? 'distance'
        : pending.length === 3
          ? 'angle'
          : 'dihedral'
      this.addMeasurement(type, pending.slice(0, 4))
    }
  }

  onResize(width: number, height: number) {
    this.primitives.resize(width, height)
  }

  dispose() {
    this.clearVisuals()
  }

  private addMeasurement(type: MeasureType, atoms: Atom[]) {
    const points = atoms.map(atom => new THREE.Vector3(atom.x, atom.y, atom.z))
    const label = this.builder.render(type, points, this.measureStyle)
    if (label) this.measureLabelPositions.push(label)
  }

  private clearVisuals() {
    disposeObject3D(this.measureGroup)
    this.measureGroup.clear()
    this.primitives.reset()
    this.measureLabelPositions = []
  }
}
