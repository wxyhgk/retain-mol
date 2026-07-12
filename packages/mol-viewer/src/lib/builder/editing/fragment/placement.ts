import * as THREE from 'three'
import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { lookupBondLengthByOrder } from '../../../../config/geometry.config'
import { newBond } from '../../../molecule'
import { calcBondLength } from '../../geometry/vsepr'
import { instantiate } from './instantiate'

/**
 * 点空白放置完整片段。viewDir（模型局部坐标的相机视线方向）用于把
 * 片段的 xy 平面转到正对相机 —— 苯环放下来就是面向你的正六边形。
 */
export function placeFragmentStandalone(
  mol: Molecule,
  frag: FragmentDef,
  center: { x: number; y: number; z: number },
  viewDir?: { x: number; y: number; z: number },
): Molecule {
  const q = new THREE.Quaternion()
  const coordinationTilt = frag.group === 'coordination'
    ? new THREE.Quaternion().setFromEuler(new THREE.Euler(0.38, -0.46, 0.16))
    : null
  if (viewDir) {
    const v = new THREE.Vector3(viewDir.x, viewDir.y, viewDir.z)
    if (v.lengthSq() > 1e-9) q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), v.normalize())
  }
  if (coordinationTilt) q.multiply(coordinationTilt)

  // Coordination fragments are authored around the metal center. Other
  // fragments keep their historical centroid anchor.
  const centroid = new THREE.Vector3()
  if (frag.group === 'coordination') {
    const center = frag.atoms[frag.attachIndex]
    centroid.set(center.x, center.y, center.z)
  } else {
    for (const a of frag.atoms) centroid.add(new THREE.Vector3(a.x, a.y, a.z))
    centroid.divideScalar(frag.atoms.length)
  }
  const target = new THREE.Vector3(center.x, center.y, center.z)

  const { atoms, bonds } = instantiate(frag, p => p.sub(centroid).applyQuaternion(q).add(target))
  return { ...mol, atoms: [...mol.atoms, ...atoms], bonds: [...mol.bonds, ...bonds] }
}

/**
 * 点空白放杂化桩（attachOrder>1）→ 放最小完整原型分子：中心桩与碳的「同级桩」
 * （=CH₂ / ≡CH）沿双/三键相连。孤立的杂化中心无化学意义（同 GaussView），故补一个
 * 碳伙伴凑成真实小分子：=C→乙烯 · ≡C→乙炔 · =N→甲亚胺 · ≡N→HCN · =O→甲醛。
 *
 * 几何不走 VSEPR 推测（会把 sp 猜弯），而是直接沿「中心桩自己设计好的 attach 轴」相接：
 * 两桩各去掉 attach-H，把 attach 原子沿该轴按键长拉开、伙伴桩反向对齐 —— sp 必线性、
 * sp² 必平面 120°。H 数全用片段烘死的（不走 addHydrogens），价态才对。
 */
export function placeHybridPrototype(
  mol: Molecule,
  frag: FragmentDef,
  partner: FragmentDef,
  center: { x: number; y: number; z: number },
  viewDir?: { x: number; y: number; z: number },
): Molecule {
  const q = new THREE.Quaternion()
  if (viewDir) {
    const v = new THREE.Vector3(viewDir.x, viewDir.y, viewDir.z)
    if (v.lengthSq() > 1e-9) q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), v.normalize())
  }

  // 中心桩：attach 原子落到点击点，attach-H 方向（= 开价轴）经相机旋转到世界系
  const cA = frag.atoms[frag.attachIndex], cH = frag.atoms[frag.attachHIndex]
  const cOrigin = new THREE.Vector3(cA.x, cA.y, cA.z)
  const axis = new THREE.Vector3(cH.x - cA.x, cH.y - cA.y, cH.z - cA.z).normalize().applyQuaternion(q)
  const target = new THREE.Vector3(center.x, center.y, center.z)
  const centerInst = instantiate(frag, p => p.sub(cOrigin).applyQuaternion(q).add(target), frag.attachHIndex)

  // 键长按键级取（双/三键更短），退回单键估算
  const order = partner.attachOrder ?? 1
  const pA = partner.atoms[partner.attachIndex], pH = partner.atoms[partner.attachHIndex]
  const bLen = lookupBondLengthByOrder(cA.symbol, pA.symbol, order) ?? calcBondLength(cA.symbol, pA.symbol)

  // 伙伴桩：attach 原子落在开价轴上、按键长拉开；其 attach 轴对齐到 -axis（指回中心）
  const pOrigin = new THREE.Vector3(pA.x, pA.y, pA.z)
  const pAxis = new THREE.Vector3(pH.x - pA.x, pH.y - pA.y, pH.z - pA.z).normalize()
  const qP = new THREE.Quaternion().setFromUnitVectors(pAxis, axis.clone().negate())
  const anchor = target.clone().addScaledVector(axis, bLen)
  const partnerInst = instantiate(partner, p => p.sub(pOrigin).applyQuaternion(qP).add(anchor), partner.attachHIndex)

  const link = newBond(
    centerInst.idByIndex.get(frag.attachIndex)!,
    partnerInst.idByIndex.get(partner.attachIndex)!,
    order,
  )
  return {
    ...mol,
    atoms: [...mol.atoms, ...centerInst.atoms, ...partnerInst.atoms],
    bonds: [...mol.bonds, ...centerInst.bonds, ...partnerInst.bonds, link],
  }
}
