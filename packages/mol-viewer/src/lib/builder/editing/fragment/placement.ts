import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { lookupBondLengthByOrder } from '../../../../config/geometry.config'
import { newBond } from '../../../molecule'
import { calcBondLength } from '../../geometry/vsepr'
import { instantiate } from './instantiate'
import {
  add,
  applyQuat,
  identityQuat,
  length,
  multiplyQuats,
  normalize,
  quatFromEuler,
  quatFromUnitVectors,
  scale,
  sub,
  type Vec3,
} from '../../math'
import { getFragmentAtom, requireFragmentAtomAttachment } from './fragmentGuards'

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
  let q = identityQuat()
  const coordinationTilt = frag.group === 'coordination'
    ? quatFromEuler(0.38, -0.46, 0.16)
    : null
  if (viewDir) {
    const v: Vec3 = [viewDir.x, viewDir.y, viewDir.z]
    if (length(v) > 1e-9) q = quatFromUnitVectors([0, 0, 1], normalize(v))
  }
  if (coordinationTilt) q = multiplyQuats(q, coordinationTilt)

  // Coordination fragments are authored around the metal center. Other
  // fragments keep their historical centroid anchor.
  let centroid: Vec3 = [0, 0, 0]
  if (frag.group === 'coordination') {
    const centerAtom = getFragmentAtom(frag, frag.attachIndex)
    if (!centerAtom || centerAtom.symbol === 'H') {
      throw new Error(`${frag.name}: attachIndex 必须指向有效的重原子`)
    }
    centroid = [centerAtom.x, centerAtom.y, centerAtom.z]
  } else {
    for (const atom of frag.atoms) centroid = add(centroid, [atom.x, atom.y, atom.z])
    centroid = scale(centroid, 1 / frag.atoms.length)
  }
  const target: Vec3 = [center.x, center.y, center.z]

  const { atoms, bonds } = instantiate(frag, p => add(applyQuat(sub(p, centroid), q), target))
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
  let q = identityQuat()
  if (viewDir) {
    const v: Vec3 = [viewDir.x, viewDir.y, viewDir.z]
    if (length(v) > 1e-9) q = quatFromUnitVectors([0, 0, 1], normalize(v))
  }

  // 中心桩：attach 原子落到点击点，attach-H 方向（= 开价轴）经相机旋转到世界系
  const centerAttachment = requireFragmentAtomAttachment(frag)
  const partnerAttachment = requireFragmentAtomAttachment(partner)
  if (centerAttachment.attachHydrogenIndex === null || partnerAttachment.attachHydrogenIndex === null) {
    throw new Error('杂化原型必须使用 attach-H 定义连接方向')
  }
  const cA = centerAttachment.attachAtom
  const cOrigin: Vec3 = [cA.x, cA.y, cA.z]
  const axis = applyQuat(normalize(centerAttachment.authoredDirection), q)
  const target: Vec3 = [center.x, center.y, center.z]
  const centerInst = instantiate(
    frag,
    p => add(applyQuat(sub(p, cOrigin), q), target),
    centerAttachment.attachHydrogenIndex,
  )

  // 键长按键级取（双/三键更短），退回单键估算
  const order = partner.attachOrder ?? 1
  const pA = partnerAttachment.attachAtom
  const bLen = lookupBondLengthByOrder(cA.symbol, pA.symbol, order) ?? calcBondLength(cA.symbol, pA.symbol)

  // 伙伴桩：attach 原子落在开价轴上、按键长拉开；其 attach 轴对齐到 -axis（指回中心）
  const pOrigin: Vec3 = [pA.x, pA.y, pA.z]
  const pAxis = normalize(partnerAttachment.authoredDirection)
  const qP = quatFromUnitVectors(pAxis, scale(axis, -1))
  const anchor = add(target, scale(axis, bLen))
  const partnerInst = instantiate(
    partner,
    p => add(applyQuat(sub(p, pOrigin), qP), anchor),
    partnerAttachment.attachHydrogenIndex,
  )

  const centerAttachAtomId = centerInst.idByIndex.get(centerAttachment.attachAtomIndex)
  const partnerAttachAtomId = partnerInst.idByIndex.get(partnerAttachment.attachAtomIndex)
  if (centerAttachAtomId === undefined || partnerAttachAtomId === undefined) {
    throw new Error('杂化原型连接原子未被实例化')
  }
  const link = newBond(centerAttachAtomId, partnerAttachAtomId, order)
  return {
    ...mol,
    atoms: [...mol.atoms, ...centerInst.atoms, ...partnerInst.atoms],
    bonds: [...mol.bonds, ...centerInst.bonds, ...partnerInst.bonds, link],
  }
}
