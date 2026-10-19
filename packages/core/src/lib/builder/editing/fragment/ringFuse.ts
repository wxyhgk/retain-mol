import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import type { AttachResult } from './types'
import { planRingFusePlacement } from './ringFusePlacement'
import { buildRingFuseFragmentFrame, buildRingFuseTargetFrame } from './ringFuseGeometry'
import { buildRingFuseOrderOverrideCandidates, ringFuseMinAddedOrders } from './ringFuseKekule'
import { buildRingFuseSkipSet, resolveRingFuseTarget, validateRingFuseSharedValence } from './ringFuseRules'
import { getFragmentAtom, resolveFragmentBondAttachment } from './fragmentGuards'

/**
 * Ketcher 式并环：点击已有的键，把模板环的 attachBond 边融合上去
 * （苯环模板点 C-C 键 → 萘式稠环）。
 *
 * 几何：模板边中点/方向/环体朝向 三轴对齐到目标键。方向自动探索：
 * 先放在远离已有取代基的一侧，撞到已有原子则自动翻到另一侧再试。
 * 新环原子落在已有同元素原子上（凹区并环，如菲 bay 区拼芘）→ 自动
 * 合并共用该原子（Ketcher 行为），并删掉它多余的 H。
 * 共享边的两个原子各删一个 H（取离新环最近的）。
 * 键级：含双键的模板沿环路径重排凯库勒交替，使其与目标键键级衔接。
 */
export function fuseFragmentOnBond(
  mol: Molecule,
  frag: FragmentDef,
  bondId: string,
): AttachResult {
  const fragmentAttachment = resolveFragmentBondAttachment(frag)
  if (fragmentAttachment.ok === false) {
    const reason = frag.attachBond ? fragmentAttachment.reason : `${frag.name} 是基团，请点击原子连接`
    return { ok: false, reason }
  }
  const target = resolveRingFuseTarget(mol, bondId)
  if (target.ok === false) return { ok: false, reason: target.reason }

  const { index1: f1i, index2: f2i } = fragmentAttachment.value
  const isH = (i: number) => getFragmentAtom(frag, i)?.symbol === 'H'
  const skip = buildRingFuseSkipSet(frag, f1i, f2i, isH)

  const atomById = new Map(mol.atoms.map(a => [a.id, a]))
  const fragmentFrame = buildRingFuseFragmentFrame(frag, f1i, f2i)
  if (!fragmentFrame) return { ok: false, reason: '模板几何异常' }
  const targetFrame = buildRingFuseTargetFrame(mol, target.targetAtom1, target.targetAtom2)

  // 凯库勒交替给出两个相位候选（首选在前）：目标是凯库勒单键时首选相位
  // 可能让共享原子超价，由 remapAndMergeBonds 的键级和校验拒绝、备选相位顶上。
  const overridePhases = buildRingFuseOrderOverrideCandidates(frag, f1i, f2i, target.bond.order, isH)
  const addedOrders = ringFuseMinAddedOrders(frag, f1i, f2i, overridePhases, isH)

  // 端点交换会让共享原子映射到 f1 或 f2 —— 预检取两端新增键级的较小值，避免误拒
  const minAddedOrder = Math.min(addedOrders.atF1, addedOrders.atF2)
  const addedOrderByAtomId = new Map<string, number>([
    [target.targetAtom1.id, minAddedOrder],
    [target.targetAtom2.id, minAddedOrder],
  ])
  // 快速失败：连最小新增键级都放不下 → 友好报错（合并式并环共享原子可能
  // 不新增连接，所以真正的裁决在拓扑装配的最终键级和校验里）
  const sharedValenceError = validateRingFuseSharedValence(
    mol,
    [target.targetAtom1, target.targetAtom2],
    addedOrderByAtomId,
  )

  // 方向自动探索：交换共享边端点并尝试两侧，共四种共面构型（sp3 稠合时
  // 再绕共享键滚转采样）。优先零合并的干净并环（外侧），其次才是合并式
  // 并环（凹区拼稠环，如菲 bay → 芘）。
  const candidate = planRingFusePlacement({
    molecule: mol,
    fragment: frag,
    f1i,
    f2i,
    targetAtom1: target.targetAtom1,
    targetAtom2: target.targetAtom2,
    skip,
    isHydrogenIndex: isH,
    fragmentMidpoint: fragmentFrame.midpoint,
    fragmentAxis1: fragmentFrame.axis1,
    fragmentAxis2: fragmentFrame.axis2,
    fragmentAxis3: fragmentFrame.axis3,
    fragmentCentroid: fragmentFrame.centroid,
    targetMidpoint: targetFrame.midpoint,
    targetAxis1: targetFrame.axis1,
    preferredTargetAxis2: targetFrame.preferredAxis2,
    orderOverride: overridePhases[0] ?? new Map<string, 1 | 2 | 3>(),
    orderOverrideAlternatives: overridePhases.slice(1),
    atomById,
  })
  if (!candidate) {
    return { ok: false, reason: sharedValenceError ?? '该键两侧空间都放不下新环' }
  }
  // 没有几何合并时，共享端点必然各新增一条连接，可做严格键价检查。
  // peri/bay 路径会把模板原子合并到现有原子（共享原子未必新增连接），
  // 它们由 remapAndMergeBonds 的最终键级和校验裁决。
  if (candidate.mergeCount === 0 && sharedValenceError) {
    return { ok: false, reason: sharedValenceError }
  }
  return { ok: true, molecule: candidate.molecule }
}
