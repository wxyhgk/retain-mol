import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { DEFAULT_MEASURE_STYLE } from '../types'
import { MeasurePrimitiveFactory } from './MeasurePrimitiveFactory'
import { MeasurementVisualBuilder } from './MeasurementVisualBuilder'

describe('MeasurementVisualBuilder', () => {
  it('builds a distance line and returns its formatted label', () => {
    const group = new THREE.Group()
    const canvas = { clientWidth: 800, clientHeight: 600 } as HTMLCanvasElement
    const builder = new MeasurementVisualBuilder(new MeasurePrimitiveFactory(group, canvas))

    const label = builder.render(
      'distance',
      [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.25, 0, 0)],
      DEFAULT_MEASURE_STYLE,
    )

    expect(label?.text).toBe('1.250 Å')
    expect(label?.pos.x).toBeCloseTo(0.625)
    expect(group.children.length).toBeGreaterThan(2)
  })
})
