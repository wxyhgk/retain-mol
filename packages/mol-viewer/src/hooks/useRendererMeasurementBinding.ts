import { useEffect } from 'react'
import type { Atom } from '../lib/molecule'
import type { Measurement } from '../lib/types'
import type { SceneObject } from '../lib/sceneObject'
import type { RendererMeasurementBindingOptions } from './rendererSceneBindingTypes'

interface ResolvedMeasurement {
  readonly type: Measurement['type']
  readonly atoms: Atom[]
  readonly expected: number
}

export function resolveMeasurementAtoms(
  sceneObjects: readonly SceneObject[],
  measurements: readonly Measurement[],
  pendingAtomIds: readonly string[],
): { committed: ResolvedMeasurement[]; pending: Atom[] } {
  const atomMap = new Map<string, Atom>()
  for (const object of sceneObjects) {
    // 隐藏对象的原子不参与测量解析：分子本体已按 visible 隐藏
    //（MoleculeSceneLayer），其测量线/标签若继续渲染就成了悬浮在空处的孤儿图元
    if (object.visible === false) continue
    for (const atom of object.molecule.atoms) atomMap.set(atom.id, atom)
  }

  const getAtoms = (ids: readonly string[]) =>
    ids.map(id => atomMap.get(id)).filter((atom): atom is Atom => atom !== undefined)
  const committed = measurements
    .map(measurement => ({
      type: measurement.type,
      atoms: getAtoms(measurement.atomIds),
      expected: measurement.atomIds.length,
    }))
    .filter(measurement => measurement.atoms.length === measurement.expected)

  return { committed, pending: getAtoms(pendingAtomIds) }
}

export function useRendererMeasurementBinding({
  rendererRef,
  sceneObjects,
  measurements,
  pendingAtomIds,
  measureStyle,
}: RendererMeasurementBindingOptions) {
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    renderer.measureStyle = measureStyle
    const { committed, pending } = resolveMeasurementAtoms(
      sceneObjects,
      measurements,
      pendingAtomIds,
    )
    renderer.updateMeasureVisuals(committed, pending)
  }, [measurements, pendingAtomIds, measureStyle, sceneObjects, rendererRef])
}
