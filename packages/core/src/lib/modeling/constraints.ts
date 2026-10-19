import type { Molecule } from '../molecule'
import type {
  ModelingCommand,
  ModelingConstraints,
  ModelingIssue,
} from './contracts'

function constraintIssue(message: string, path?: string): ModelingIssue {
  return {
    severity: 'error',
    code: 'constraint-violation',
    message,
    ...(path ? { path } : {}),
  }
}

function validateAtomIdList(
  molecule: Molecule,
  atomIds: readonly string[],
  path: 'constraints.fixedAtomPositions' | 'constraints.protectedAtomIds',
): readonly ModelingIssue[] {
  const existingAtomIds = new Set(molecule.atoms.map(atom => atom.id))
  const seen = new Set<string>()
  const issues: ModelingIssue[] = []

  atomIds.forEach((atomId, index) => {
    if (seen.has(atomId)) {
      issues.push(constraintIssue(`约束中的原子 id 重复：${atomId}`, `${path}.${index}`))
    } else if (!existingAtomIds.has(atomId)) {
      issues.push(constraintIssue(`约束引用的原子不存在：${atomId}`, `${path}.${index}`))
    }
    seen.add(atomId)
  })

  return issues
}

/** Validate constraint references against the molecule used as the execution baseline. */
export function validateModelingConstraints(
  molecule: Molecule,
  constraints: ModelingConstraints | undefined,
): readonly ModelingIssue[] {
  if (!constraints) return []
  return [
    ...validateAtomIdList(
      molecule,
      constraints.fixedAtomPositions ?? [],
      'constraints.fixedAtomPositions',
    ),
    ...validateAtomIdList(
      molecule,
      constraints.protectedAtomIds ?? [],
      'constraints.protectedAtomIds',
    ),
  ]
}

/** Reject commands whose operation is forbidden regardless of their eventual output. */
export function validateModelingCommandConstraints(
  command: ModelingCommand,
  constraints: ModelingConstraints | undefined,
): ModelingIssue | null {
  if (!constraints || (command.kind !== 'atom.remove' && command.kind !== 'atom.replace')) {
    return null
  }
  if (!constraints.protectedAtomIds?.includes(command.atomId)) return null
  return constraintIssue(
    command.kind === 'atom.remove'
      ? `受保护原子不可删除：${command.atomId}`
      : `受保护原子不可替换元素：${command.atomId}`,
  )
}

/** Validate coordinate and atom-identity invariants after command execution. */
export function validateModelingConstraintInvariants(
  before: Molecule,
  after: Molecule,
  constraints: ModelingConstraints | undefined,
): readonly ModelingIssue[] {
  if (!constraints) return []
  const beforeAtoms = new Map(before.atoms.map(atom => [atom.id, atom]))
  const afterAtoms = new Map(after.atoms.map(atom => [atom.id, atom]))
  const issues: ModelingIssue[] = []

  for (const atomId of constraints.fixedAtomPositions ?? []) {
    const expected = beforeAtoms.get(atomId)
    const actual = afterAtoms.get(atomId)
    if (!expected) {
      issues.push(constraintIssue(`固定坐标约束引用的原子不存在：${atomId}`))
    } else if (!actual) {
      issues.push(constraintIssue(`固定坐标原子不可删除：${atomId}`))
    } else if (actual.x !== expected.x || actual.y !== expected.y || actual.z !== expected.z) {
      issues.push(constraintIssue(`固定坐标原子不可移动：${atomId}`))
    }
  }

  for (const atomId of constraints.protectedAtomIds ?? []) {
    const expected = beforeAtoms.get(atomId)
    const actual = afterAtoms.get(atomId)
    if (!expected) {
      issues.push(constraintIssue(`受保护约束引用的原子不存在：${atomId}`))
    } else if (!actual) {
      issues.push(constraintIssue(`受保护原子不可删除：${atomId}`))
    } else if (actual.symbol !== expected.symbol) {
      issues.push(constraintIssue(`受保护原子不可替换元素：${atomId}`))
    }
  }

  return issues
}
