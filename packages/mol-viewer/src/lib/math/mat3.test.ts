import { describe, expect, it } from 'vitest'
import {
  applyMat3,
  rotationBetweenOrthonormalBases,
  type OrthonormalBasis,
} from './mat3'
import type { Vec3 } from './vec3'

function expectVecClose(actual: Vec3, expected: Vec3): void {
  expected.forEach((value, index) => expect(actual[index]).toBeCloseTo(value, 10))
}

describe('Mat3 basis rotation', () => {
  const standard: OrthonormalBasis = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]

  it('keeps vectors unchanged when source and target bases match', () => {
    const rotation = rotationBetweenOrthonormalBases(standard, standard)
    expectVecClose(applyMat3([2, -3, 4], rotation), [2, -3, 4])
  })

  it('maps every source axis to its corresponding target axis', () => {
    const target: OrthonormalBasis = [
      [0, 1, 0],
      [-1, 0, 0],
      [0, 0, 1],
    ]
    const rotation = rotationBetweenOrthonormalBases(standard, target)

    expectVecClose(applyMat3(standard[0], rotation), target[0])
    expectVecClose(applyMat3(standard[1], rotation), target[1])
    expectVecClose(applyMat3(standard[2], rotation), target[2])
    expectVecClose(applyMat3([2, 3, 4], rotation), [-3, 2, 4])
  })

  it('maps a non-standard source basis into the target basis', () => {
    const source: OrthonormalBasis = [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ]
    const target: OrthonormalBasis = [
      [1, 0, 0],
      [0, -1, 0],
      [0, 0, -1],
    ]
    const rotation = rotationBetweenOrthonormalBases(source, target)

    expectVecClose(applyMat3(source[0], rotation), target[0])
    expectVecClose(applyMat3(source[1], rotation), target[1])
    expectVecClose(applyMat3(source[2], rotation), target[2])
  })
})
