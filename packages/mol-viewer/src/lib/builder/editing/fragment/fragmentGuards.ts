import type { FragmentAtom, FragmentBond, FragmentDef } from '../../fragmentLibrary'
import type { Vec3 } from '../../math'

export interface FragmentAtomAttachment {
  readonly attachAtom: FragmentAtom
  readonly attachAtomIndex: number
  readonly attachHydrogen: FragmentAtom | null
  readonly attachHydrogenIndex: number | null
  readonly authoredDirection: Vec3
}

export interface FragmentBondAttachment {
  readonly atom1: FragmentAtom
  readonly atom2: FragmentAtom
  readonly bond: FragmentBond
  readonly index1: number
  readonly index2: number
}

type GuardResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reason: string }

export function getFragmentAtom(fragment: FragmentDef, index: number): FragmentAtom | null {
  if (!Number.isInteger(index) || index < 0) return null
  return fragment.atoms[index] ?? null
}

export function resolveFragmentAtomAttachment(fragment: FragmentDef): GuardResult<FragmentAtomAttachment> {
  const attachAtom = getFragmentAtom(fragment, fragment.attachIndex)
  if (!attachAtom) return invalid(`attachIndex ${fragment.attachIndex} 不存在`)
  if (attachAtom.symbol === 'H') return invalid('attachIndex 必须指向重原子')

  if (fragment.attachHIndex >= 0) {
    const attachHydrogen = getFragmentAtom(fragment, fragment.attachHIndex)
    if (!attachHydrogen) return invalid(`attachHIndex ${fragment.attachHIndex} 不存在`)
    if (attachHydrogen.symbol !== 'H') return invalid('attachHIndex 必须指向 H')
    if (!findFragmentBond(fragment, fragment.attachIndex, fragment.attachHIndex)) {
      return invalid('attachIndex 与 attachHIndex 之间没有模板键')
    }
    const authoredDirection: Vec3 = [
      attachHydrogen.x - attachAtom.x,
      attachHydrogen.y - attachAtom.y,
      attachHydrogen.z - attachAtom.z,
    ]
    if (!isUsableDirection(authoredDirection)) return invalid('attach-H 方向无效')
    return {
      ok: true,
      value: {
        attachAtom,
        attachAtomIndex: fragment.attachIndex,
        attachHydrogen,
        attachHydrogenIndex: fragment.attachHIndex,
        authoredDirection,
      },
    }
  }

  const attachDirection = fragment.attachDirection
  if (!attachDirection || !isUsableDirection(attachDirection)) {
    return invalid('模板缺少有效的连接方向')
  }
  return {
    ok: true,
    value: {
      attachAtom,
      attachAtomIndex: fragment.attachIndex,
      attachHydrogen: null,
      attachHydrogenIndex: null,
      authoredDirection: [attachDirection[0], attachDirection[1], attachDirection[2]],
    },
  }
}

export function requireFragmentAtomAttachment(fragment: FragmentDef): FragmentAtomAttachment {
  const result = resolveFragmentAtomAttachment(fragment)
  if (result.ok === true) return result.value
  throw new Error(`${fragment.name}: ${result.reason}`)
}

export function resolveFragmentBondAttachment(fragment: FragmentDef): GuardResult<FragmentBondAttachment> {
  const attachBond = fragment.attachBond
  if (!attachBond) return invalid('模板没有 attachBond')
  const [index1, index2] = attachBond
  if (index1 === index2) return invalid('attachBond 不能是自环')

  const atom1 = getFragmentAtom(fragment, index1)
  const atom2 = getFragmentAtom(fragment, index2)
  if (!atom1 || !atom2) return invalid('attachBond 引用了不存在的原子')
  if (atom1.symbol === 'H' || atom2.symbol === 'H') {
    return invalid('attachBond 两端必须是重原子')
  }
  const bond = findFragmentBond(fragment, index1, index2)
  if (!bond) return invalid('attachBond 两端没有模板键')
  return { ok: true, value: { atom1, atom2, bond, index1, index2 } }
}

export function findFragmentBond(
  fragment: FragmentDef,
  index1: number,
  index2: number,
): FragmentBond | null {
  return fragment.bonds.find(bond => (
    (bond.a === index1 && bond.b === index2)
    || (bond.a === index2 && bond.b === index1)
  )) ?? null
}

function isUsableDirection(direction: readonly number[]): direction is readonly [number, number, number] {
  return direction.length === 3
    && direction.every(Number.isFinite)
    && Math.hypot(direction[0] ?? 0, direction[1] ?? 0, direction[2] ?? 0) > 1e-9
}

function invalid(reason: string): GuardResult<never> {
  return { ok: false, reason }
}
