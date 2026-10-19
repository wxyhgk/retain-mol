import * as THREE from 'three'
import {
  REACTION_HIGHLIGHT_GEOMETRY,
  REACTION_HIGHLIGHT_STYLES,
} from '../../config/reactionHighlights.config'
import type { ReactionHighlight } from '../reactionHighlights'

type ResolveAtomPosition = (atomId: string, target: THREE.Vector3) => boolean

interface ResolvedStyle {
  readonly color: string
  readonly radius: number
  readonly dashed: boolean
  readonly opacity: number
}

interface HighlightVisual {
  readonly signature: string
  readonly group: THREE.Group
  readonly segmentGeometry: THREE.CylinderGeometry
  readonly segmentMaterial: THREE.MeshBasicMaterial
  readonly segments: THREE.Mesh[]
  readonly endpointGeometry: THREE.SphereGeometry
  readonly endpointMaterial: THREE.MeshBasicMaterial
  readonly endpoints: readonly [THREE.Mesh, THREE.Mesh]
  readonly label: THREE.Sprite | null
  readonly labelMaterial: THREE.SpriteMaterial | null
  readonly labelTexture: THREE.CanvasTexture | null
  readonly style: ResolvedStyle
}

const UNIT_Y = new THREE.Vector3(0, 1, 0)
const MIN_LENGTH = 1e-8

function finitePositive(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback
}

function finiteOpacity(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value)
    ? THREE.MathUtils.clamp(value, 0, 1)
    : fallback
}

function resolveStyle(definition: ReactionHighlight): ResolvedStyle {
  const fallback = REACTION_HIGHLIGHT_STYLES[definition.kind]
  return {
    color: definition.color ?? fallback.color,
    radius: finitePositive(definition.radius, fallback.radius),
    dashed: definition.dashed ?? fallback.dashed,
    opacity: finiteOpacity(definition.opacity, fallback.opacity),
  }
}

function visualSignature(definition: ReactionHighlight, style: ResolvedStyle): string {
  return JSON.stringify([
    definition.atomId1,
    definition.atomId2,
    definition.kind,
    definition.label ?? '',
    style.color,
    style.radius,
    style.dashed,
    style.opacity,
  ])
}

function createLabel(
  text: string,
  color: string,
): {
  sprite: THREE.Sprite
  material: THREE.SpriteMaterial
  texture: THREE.CanvasTexture
} | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = REACTION_HIGHLIGHT_GEOMETRY.labelWidth
  canvas.height = REACTION_HIGHLIGHT_GEOMETRY.labelHeight
  const context = canvas.getContext('2d')
  if (!context) return null
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.font = '600 25px system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.lineWidth = 5
  context.strokeStyle = 'rgba(0, 0, 0, 0.8)'
  context.fillStyle = color
  context.strokeText(text, canvas.width / 2, canvas.height / 2)
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(material)
  const width = REACTION_HIGHLIGHT_GEOMETRY.labelWorldWidth
  sprite.scale.set(width, width / 4, 1)
  sprite.userData = { type: 'reaction-highlight-label', pickable: false }
  return { sprite, material, texture }
}

function setCylinderBetween(
  mesh: THREE.Mesh,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
): void {
  const direction = end.clone().sub(start)
  const length = direction.length()
  mesh.position.copy(start).add(end).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(UNIT_Y, direction.normalize())
  mesh.scale.set(radius, length, radius)
  mesh.visible = length > MIN_LENGTH
}

export class ReactionHighlightManager {
  readonly group = new THREE.Group()
  private readonly definitions = new Map<string, ReactionHighlight>()
  private readonly visuals = new Map<string, HighlightVisual>()
  private readonly positions = new Map<string, readonly [THREE.Vector3, THREE.Vector3]>()
  private readonly start = new THREE.Vector3()
  private readonly end = new THREE.Vector3()

  constructor(
    private readonly modelGroup: THREE.Group,
    private readonly resolveAtomPosition: ResolveAtomPosition,
    private readonly invalidate: () => void,
  ) {
    this.group.name = 'reaction-highlights'
    this.group.userData = { type: 'reaction-highlights', pickable: false }
    this.modelGroup.add(this.group)
  }

  setHighlights(highlights: readonly ReactionHighlight[]): void {
    const next = new Map<string, ReactionHighlight>()
    for (const highlight of highlights) next.set(highlight.id, highlight)

    for (const [id, visual] of this.visuals) {
      const definition = next.get(id)
      if (definition) {
        const style = resolveStyle(definition)
        if (visual.signature === visualSignature(definition, style)) continue
      }
      this.disposeVisual(id, visual)
    }

    this.definitions.clear()
    for (const [id, definition] of next) this.definitions.set(id, definition)
    this.update()
    this.invalidate()
  }

  update(): void {
    let changed = false
    this.positions.clear()
    for (const [id, definition] of this.definitions) {
      const hasStart = this.resolveAtomPosition(definition.atomId1, this.start)
      const hasEnd = this.resolveAtomPosition(definition.atomId2, this.end)
      if (!hasStart || !hasEnd || this.start.distanceToSquared(this.end) < MIN_LENGTH ** 2) {
        const stale = this.visuals.get(id)
        if (stale) {
          this.disposeVisual(id, stale)
          changed = true
        }
        continue
      }

      const style = resolveStyle(definition)
      const signature = visualSignature(definition, style)
      let visual = this.visuals.get(id)
      if (!visual || visual.signature !== signature) {
        if (visual) this.disposeVisual(id, visual)
        visual = this.createVisual(definition, style, signature)
        this.visuals.set(id, visual)
        changed = true
      }
      this.updateVisual(visual, this.start, this.end)
      this.positions.set(id, [this.start.clone(), this.end.clone()])
    }
    if (changed) this.invalidate()
  }

  getFocusPoints(): THREE.Vector3[] {
    this.update()
    return [...this.positions.values()].flatMap(([start, end]) => [start.clone(), end.clone()])
  }

  clear(): void {
    this.definitions.clear()
    this.positions.clear()
    for (const [id, visual] of [...this.visuals]) this.disposeVisual(id, visual)
    this.invalidate()
  }

  dispose(): void {
    this.clear()
    this.modelGroup.remove(this.group)
  }

  private createVisual(
    definition: ReactionHighlight,
    style: ResolvedStyle,
    signature: string,
  ): HighlightVisual {
    const group = new THREE.Group()
    group.name = `reaction-highlight:${definition.id}`
    group.userData = {
      type: 'reaction-highlight',
      id: definition.id,
      kind: definition.kind,
      pickable: false,
    }

    const segmentGeometry = new THREE.CylinderGeometry(
      1,
      1,
      1,
      REACTION_HIGHLIGHT_GEOMETRY.radialSegments,
      1,
      false,
    )
    const segmentMaterial = new THREE.MeshBasicMaterial({
      color: style.color,
      // Keep annotations in the transparent pass after opaque atoms have
      // populated the depth buffer, including when the requested opacity is 1.
      transparent: true,
      opacity: style.opacity,
      depthTest: true,
      depthWrite: false,
    })
    const segmentCount = style.dashed ? REACTION_HIGHLIGHT_GEOMETRY.dashCount : 1
    const segments = Array.from({ length: segmentCount }, () => {
      const mesh = new THREE.Mesh(segmentGeometry, segmentMaterial)
      mesh.userData = { type: 'reaction-highlight-segment', pickable: false }
      group.add(mesh)
      return mesh
    })

    const endpointGeometry = new THREE.SphereGeometry(
      1,
      REACTION_HIGHLIGHT_GEOMETRY.radialSegments,
      Math.max(8, REACTION_HIGHLIGHT_GEOMETRY.radialSegments / 2),
    )
    const endpointMaterial = new THREE.MeshBasicMaterial({
      color: style.color,
      transparent: true,
      opacity: style.opacity * REACTION_HIGHLIGHT_GEOMETRY.endpointOpacityScale,
      depthTest: true,
      depthWrite: false,
      wireframe: true,
    })
    const endpoints = [
      new THREE.Mesh(endpointGeometry, endpointMaterial),
      new THREE.Mesh(endpointGeometry, endpointMaterial),
    ] as const
    for (const endpoint of endpoints) {
      endpoint.userData = { type: 'reaction-highlight-endpoint', pickable: false }
      group.add(endpoint)
    }

    const labelParts = definition.label ? createLabel(definition.label, style.color) : null
    if (labelParts) group.add(labelParts.sprite)
    this.group.add(group)
    return {
      signature,
      group,
      segmentGeometry,
      segmentMaterial,
      segments,
      endpointGeometry,
      endpointMaterial,
      endpoints,
      label: labelParts?.sprite ?? null,
      labelMaterial: labelParts?.material ?? null,
      labelTexture: labelParts?.texture ?? null,
      style,
    }
  }

  private updateVisual(
    visual: HighlightVisual,
    start: THREE.Vector3,
    end: THREE.Vector3,
  ): void {
    if (visual.style.dashed) {
      const count = visual.segments.length
      const fill = REACTION_HIGHLIGHT_GEOMETRY.dashFillRatio
      for (let index = 0; index < count; index += 1) {
        const dashStart = (index + (1 - fill) / 2) / count
        const dashEnd = (index + (1 + fill) / 2) / count
        setCylinderBetween(
          visual.segments[index]!,
          start.clone().lerp(end, dashStart),
          start.clone().lerp(end, dashEnd),
          visual.style.radius,
        )
      }
    } else {
      setCylinderBetween(visual.segments[0]!, start, end, visual.style.radius)
    }

    const endpointRadius = visual.style.radius * REACTION_HIGHLIGHT_GEOMETRY.endpointScale
    visual.endpoints[0].position.copy(start)
    visual.endpoints[1].position.copy(end)
    for (const endpoint of visual.endpoints) endpoint.scale.setScalar(endpointRadius)
    visual.label?.position.copy(start).add(end).multiplyScalar(0.5)
  }

  private disposeVisual(id: string, visual: HighlightVisual): void {
    this.group.remove(visual.group)
    visual.segmentGeometry.dispose()
    visual.segmentMaterial.dispose()
    visual.endpointGeometry.dispose()
    visual.endpointMaterial.dispose()
    visual.labelTexture?.dispose()
    visual.labelMaterial?.dispose()
    this.visuals.delete(id)
    this.positions.delete(id)
  }
}
