import * as THREE from 'three'
import type { Atom, Bond } from '../molecule'
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import type { ResolvedRenderProfile } from '../../styles'
import { RENDER } from '../../config/render.config'
import { getSideBondPerp } from './bondGeometry'
import { syncMaterialColor } from './moleculeStylePrimitives'
import { disposeObject3D } from './disposeObject3D'
import { BondMeshFactory, type BondLineSpec } from './BondMeshFactory'

/** Owns bond mesh creation, incremental updates and GPU resources. */
export class MoleculeBondRenderer {
  readonly meshes = new Map<string, THREE.Group>()
  private readonly shapeKeys = new Map<string, string>()
  private readonly meshFactory: BondMeshFactory

  constructor(
    private readonly modelGroup: THREE.Group,
    private readonly getTheme: () => ResolvedTheme,
    private readonly getProfile: () => ResolvedRenderProfile,
  ) {
    this.meshFactory = new BondMeshFactory(getTheme, getProfile)
  }

  render(
    bonds: readonly Bond[],
    atomById: Map<string, Atom>,
    displayMode: DisplayMode,
    selectedBondIds: ReadonlySet<string>,
    aromaticBonds: ReadonlyMap<string, THREE.Vector3>,
  ) {
    this.removeMissing(new Set(bonds.map(bond => bond.id)))
    if (displayMode === 'spacefill' || displayMode === 'mtube') return
    for (const bond of bonds) {
      const atom1 = atomById.get(bond.atomId1)
      const atom2 = atomById.get(bond.atomId2)
      if (!atom1 || !atom2) continue
      this.renderBond(
        bond,
        atom1,
        atom2,
        displayMode,
        selectedBondIds.has(bond.id),
        aromaticBonds.get(bond.id),
        atomById,
        bonds,
      )
    }
  }

  clear() {
    for (const group of this.meshes.values()) {
      this.modelGroup.remove(group)
      disposeObject3D(group)
    }
    this.meshes.clear()
    this.shapeKeys.clear()
  }

  dispose() {
    this.clear()
  }

  private removeMissing(existingIds: ReadonlySet<string>) {
    for (const [id, group] of this.meshes) {
      if (existingIds.has(id)) continue
      this.modelGroup.remove(group)
      disposeObject3D(group)
      this.meshes.delete(id)
      this.shapeKeys.delete(id)
    }
  }

  private renderBond(
    bond: Bond,
    atom1: Atom,
    atom2: Atom,
    displayMode: DisplayMode,
    selected: boolean,
    aromaticCentroid: THREE.Vector3 | undefined,
    atomById: Map<string, Atom>,
    allBonds: readonly Bond[],
  ) {
    const profile = this.getProfile()
    const aromaticAsSingle = profile.aromaticBondStyle === 'single' && aromaticCentroid !== undefined
    if ((profile.aromaticBondStyle === 'kekule' || aromaticAsSingle) && aromaticCentroid !== undefined) {
      aromaticCentroid = undefined
    }

    let group = this.meshes.get(bond.id)
    const effectiveOrder = aromaticAsSingle ? 1 : bond.order
    const theme = this.getTheme()
    const stickRadius = displayMode === 'tube'
      ? theme.render.bondRadiusStick * RENDER.tubeRadiusMultiplier
      : theme.render.bondRadiusStick
    const lineSpecs = this.meshFactory.lineSpecs(effectiveOrder, stickRadius, theme.render.bondGap, displayMode)
    const shapeKey = [
      effectiveOrder,
      selected ? 1 : 0,
      aromaticCentroid ? 1 : 0,
      displayMode,
      profile.id,
      profile.bondGeometry,
      profile.bondOpenEnded ? 1 : 0,
      profile.bondTaper ?? 1,
      profile.bondStartOffsetFactor ?? 0,
      profile.multiBondRadiusScale ?? 0,
      profile.multiBondOffsetFactor ?? 0,
      stickRadius,
      theme.render.bondGap,
      this.meshFactory.atomRadius(atom1.symbol, displayMode),
      this.meshFactory.atomRadius(atom2.symbol, displayMode),
    ].join(':')

    if (group && this.shapeKeys.get(bond.id) !== shapeKey) {
      this.modelGroup.remove(group)
      disposeObject3D(group)
      this.meshes.delete(bond.id)
      this.shapeKeys.delete(bond.id)
      group = undefined
    }

    const start = new THREE.Vector3(atom1.x, atom1.y, atom1.z)
    const end = new THREE.Vector3(atom2.x, atom2.y, atom2.z)
    const direction = new THREE.Vector3().subVectors(end, start)
    const length = direction.length()
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    const directionUnit = direction.clone().normalize()
    const gap = theme.render.bondGap
    const color1 = selected ? RENDER.bondSelectedColor : this.meshFactory.elementColor(atom1.symbol)
    const color2 = selected ? RENDER.bondSelectedColor : this.meshFactory.elementColor(atom2.symbol)
    const singleColor = color1 === color2 && profile.bondColorPolicy === 'fixed'
    const perpendicular = getSideBondPerp(atom1, atom2, directionUnit, atomById, allBonds)
    const atomRadius1 = this.meshFactory.atomRadius(atom1.symbol, displayMode)
    const atomRadius2 = this.meshFactory.atomRadius(atom2.symbol, displayMode)

    if (group) {
      this.updateGroup({
        group, start, midpoint, directionUnit, perpendicular, length,
        atomRadius1, atomRadius2, stickRadius, lineSpecs,
        aromaticCentroid, gap, singleColor, color1, color2, selected,
      })
      return
    }

    group = new THREE.Group()
    group.userData = { type: 'bond', id: bond.id }
    if (aromaticCentroid) {
      this.meshFactory.addHalfBond(group, start, directionUnit, length, atomRadius1, atomRadius2, stickRadius, color1, color2, bond.id)
      const toCenter = new THREE.Vector3().subVectors(aromaticCentroid, midpoint)
      toCenter.addScaledVector(directionUnit, -toCenter.dot(directionUnit))
      if (toCenter.lengthSq() < 1e-6) toCenter.copy(perpendicular)
      else toCenter.normalize()
      const dashColor = selected ? RENDER.bondSelectedColor : RENDER.aromaticDashColor
      const dashRadius = stickRadius * RENDER.aromaticDashRadiusFactor
      const dashLength = RENDER.aromaticDashSize
      const gapLength = RENDER.aromaticGapSize
      const dashOffset = toCenter.clone().multiplyScalar(gap / 2)
      for (let distance = gapLength / 2; distance + dashLength <= length; distance += dashLength + gapLength) {
        const center = start.clone().addScaledVector(directionUnit, distance + dashLength / 2).add(dashOffset)
        const cylinder = this.meshFactory.makeCylinder(dashRadius, dashLength, dashColor, bond.id)
        cylinder.position.copy(center)
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), directionUnit)
        group.add(cylinder)
      }
    } else {
      for (const spec of lineSpecs) {
        const offset = spec.offset !== 0 ? perpendicular.clone().multiplyScalar(spec.offset) : undefined
        if (singleColor) this.meshFactory.addSingleBond(group, midpoint, directionUnit, length, spec.radius, color1, bond.id, offset)
        else this.meshFactory.addHalfBond(group, start, directionUnit, length, atomRadius1, atomRadius2, spec.radius, color1, color2, bond.id, offset)
      }
    }

    this.modelGroup.add(group)
    this.meshes.set(bond.id, group)
    this.shapeKeys.set(bond.id, shapeKey)
  }

  private updateGroup(input: {
    group: THREE.Group
    start: THREE.Vector3
    midpoint: THREE.Vector3
    directionUnit: THREE.Vector3
    perpendicular: THREE.Vector3
    length: number
    atomRadius1: number
    atomRadius2: number
    stickRadius: number
    lineSpecs: BondLineSpec[]
    aromaticCentroid: THREE.Vector3 | undefined
    gap: number
    singleColor: boolean
    color1: number
    color2: number
    selected: boolean
  }) {
    const profile = this.getProfile()
    let index = 0
    for (const child of input.group.children) {
      const cylinder = child as THREE.Mesh
      if (!cylinder.isMesh) continue
      const aromaticDash = input.aromaticCentroid ? index >= 2 : false
      if (aromaticDash) {
        const aromaticCentroid = input.aromaticCentroid
        if (!aromaticCentroid) continue
        const dashIndex = index - 2
        const dashLength = RENDER.aromaticDashSize
        const gapLength = RENDER.aromaticGapSize
        const distance = gapLength / 2 + dashIndex * (dashLength + gapLength)
        const toCenter = new THREE.Vector3().subVectors(aromaticCentroid, input.midpoint)
        toCenter.addScaledVector(input.directionUnit, -toCenter.dot(input.directionUnit))
        if (toCenter.lengthSq() < 1e-6) toCenter.set(1, 0, 0)
        else toCenter.normalize()
        cylinder.position.copy(input.start)
          .addScaledVector(input.directionUnit, distance + dashLength / 2)
          .add(toCenter.multiplyScalar(input.gap / 2))
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), input.directionUnit)
      } else {
        const line = input.singleColor ? index : input.aromaticCentroid ? 0 : Math.floor(index / 2)
        const spec = input.aromaticCentroid
          ? { offset: 0, radius: input.stickRadius }
          : input.lineSpecs[Math.min(line, input.lineSpecs.length - 1)]
        if (!spec) continue
        const halves = this.meshFactory.halfBondSegments(
          input.start, input.directionUnit, input.length, input.atomRadius1, input.atomRadius2,
        )
        const isSecond = index % 2 === 1
        const targetLength = input.singleColor ? input.length : halves[isSecond ? 1 : 0].length
        cylinder.scale.y = targetLength / this.meshFactory.geometryLength(cylinder.geometry, targetLength)
        if (input.singleColor) {
          syncMaterialColor(profile, cylinder.material, input.color1)
          cylinder.position.copy(input.midpoint)
        } else {
          const segment = halves[isSecond ? 1 : 0]
          syncMaterialColor(profile, cylinder.material, isSecond ? input.color2 : input.color1)
          cylinder.position.copy(segment.center)
        }
        if (spec.offset !== 0) cylinder.position.addScaledVector(input.perpendicular, spec.offset)
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), input.directionUnit)
      }
      if (aromaticDash) {
        syncMaterialColor(
          profile,
          cylinder.material,
          input.selected ? RENDER.bondSelectedColor : RENDER.aromaticDashColor,
        )
      }
      index += 1
    }
  }

}
