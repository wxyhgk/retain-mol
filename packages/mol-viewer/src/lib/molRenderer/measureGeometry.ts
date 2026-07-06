import * as THREE from 'three'
import { MEASURE_VIS } from '../../config/overlay.config'

/**
 * 测量可视化的纯几何计算：只算点/弧/平面角点/标注锚点，不碰 three 网格与场景图。
 * MeasureVisuals 拿这些数据去建 mesh。分离出来便于单测这些易错的向量数学。
 */

export interface AngleArcGeometry {
  /** 圆弧折线点 */
  arcPts: THREE.Vector3[]
  /** 两条边的刻度小线段 [start, end] */
  tickSegs: [THREE.Vector3, THREE.Vector3][]
  /** 角度标注锚点 */
  labelPos: THREE.Vector3
}

/** 三点夹角的弧线 + 刻度 + 标注位置。三点共线（叉积退化）返回 null。 */
export function angleArcGeometry(
  p1: THREE.Vector3, vertex: THREE.Vector3, p3: THREE.Vector3,
): AngleArcGeometry | null {
  const v1 = p1.clone().sub(vertex).normalize()
  const v2 = p3.clone().sub(vertex).normalize()
  const axis = v1.clone().cross(v2)
  if (axis.lengthSq() < 1e-12) return null
  axis.normalize()

  const totalAngle = v1.angleTo(v2)
  const arcR = MEASURE_VIS.arcRadius
  const arcPts: THREE.Vector3[] = []
  for (let i = 0; i <= MEASURE_VIS.arcSegments; i++) {
    const a = (i / MEASURE_VIS.arcSegments) * totalAngle
    const v = v1.clone().multiplyScalar(Math.cos(a)).addScaledVector(axis.clone().cross(v1), Math.sin(a))
    arcPts.push(vertex.clone().addScaledVector(v, arcR))
  }

  const tickSegs: [THREE.Vector3, THREE.Vector3][] = []
  for (const dir of [v1, v2]) {
    tickSegs.push([
      vertex.clone().addScaledVector(dir, arcR * MEASURE_VIS.arcTickMin),
      vertex.clone().addScaledVector(dir, arcR * MEASURE_VIS.arcTickMax),
    ])
  }

  const midDir = v1.clone().multiplyScalar(Math.cos(totalAngle / 2)).addScaledVector(axis.clone().cross(v1), Math.sin(totalAngle / 2))
  const labelPos = vertex.clone().addScaledVector(midDir.normalize(), arcR + MEASURE_VIS.arcLabelOffset)
  return { arcPts, tickSegs, labelPos }
}

export interface DihedralGeometry {
  /** 两个半平面的四角点 [c0,c1,c2,c3]，顺序对应 planeColor1、planeColor2 */
  planes: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3][]
  /** 二面角弧线折线点 */
  arcPts: THREE.Vector3[]
  /** 刻度小线段 */
  tickSegs: [THREE.Vector3, THREE.Vector3][]
  /** 标注锚点 */
  labelPos: THREE.Vector3
}

/** 四点二面角的两个半平面 + 弧线 + 刻度 + 标注位置。 */
export function dihedralGeometry(
  p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3,
): DihedralGeometry {
  const bondVec = p3.clone().sub(p2)
  const bondDir = bondVec.clone().normalize()
  const bondMid = p2.clone().add(p3).multiplyScalar(0.5)
  const halfLen = bondVec.length() * 0.5

  const projectPerp = (p: THREE.Vector3): THREE.Vector3 => {
    const d = p.clone().sub(bondMid)
    const perp = d.clone().addScaledVector(bondDir, -d.dot(bondDir))
    return perp.lengthSq() > 1e-12 ? perp.normalize() : new THREE.Vector3(1, 0, 0)
  }
  const perp1 = projectPerp(p1), perp4 = projectPerp(p4)

  const planeCorners = (outer: THREE.Vector3, perp: THREE.Vector3): [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3] => {
    const PAD_U = MEASURE_VIS.dihedralPadU
    const PAD_V = MEASURE_VIS.dihedralPadV
    const outerRel = outer.clone().sub(bondMid)
    const uOuter = outerRel.dot(bondDir)
    const vOuter = outerRel.dot(perp)
    const uMin = Math.min(-halfLen, uOuter) - PAD_U
    const uMax = Math.max(halfLen, uOuter) + PAD_U
    const vMin = -PAD_V * MEASURE_VIS.dihedralVMinFactor
    const vMax = Math.max(0, vOuter) + PAD_V

    const corner = (u: number, v: number) =>
      bondMid.clone().addScaledVector(bondDir, u).addScaledVector(perp, v)
    return [corner(uMin, vMin), corner(uMax, vMin), corner(uMax, vMax), corner(uMin, vMax)]
  }
  const planes: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
    planeCorners(p1, perp1),
    planeCorners(p4, perp4),
  ]

  const vMax1 = Math.max(0, p1.clone().sub(bondMid).dot(perp1))
  const vMax4 = Math.max(0, p4.clone().sub(bondMid).dot(perp4))
  const arcR = Math.min(vMax1, vMax4) * MEASURE_VIS.dihedralArcRadiusScale + MEASURE_VIS.dihedralArcRadiusBase

  const sinA = perp1.clone().cross(perp4).dot(bondDir)
  const cosA = perp1.dot(perp4)
  const dihedralAngle = Math.atan2(sinA, cosA)
  const arcPts: THREE.Vector3[] = []
  for (let i = 0; i <= MEASURE_VIS.arcSegments; i++) {
    const a = (i / MEASURE_VIS.arcSegments) * dihedralAngle
    const v = perp1.clone().multiplyScalar(Math.cos(a)).addScaledVector(bondDir.clone().cross(perp1), Math.sin(a))
    arcPts.push(bondMid.clone().addScaledVector(v, arcR))
  }

  const tickSegs: [THREE.Vector3, THREE.Vector3][] = []
  for (const perp of [perp1, perp4]) {
    tickSegs.push([
      bondMid.clone().addScaledVector(perp, arcR * MEASURE_VIS.arcTickMin),
      bondMid.clone().addScaledVector(perp, arcR * MEASURE_VIS.arcTickMax),
    ])
  }

  const midDir = perp1.clone().multiplyScalar(Math.cos(dihedralAngle / 2)).addScaledVector(bondDir.clone().cross(perp1), Math.sin(dihedralAngle / 2))
  const labelPos = bondMid.clone().addScaledVector(midDir.normalize(), arcR + MEASURE_VIS.arcLabelOffset)
  return { planes, arcPts, tickSegs, labelPos }
}
