import type { FragmentDef } from '../fragmentLibrary'

export interface FragmentValidationIssue {
  readonly fragmentId: string
  readonly code: string
  readonly message: string
}

function issue(fragment: FragmentDef, code: string, message: string): FragmentValidationIssue {
  return { fragmentId: fragment.id, code, message }
}

function isFiniteCoord(value: number): boolean {
  return Number.isFinite(value)
}

export function validateFragmentDef(fragment: FragmentDef): FragmentValidationIssue[] {
  const issues: FragmentValidationIssue[] = []
  const atomCount = fragment.atoms.length

  if (atomCount === 0) {
    issues.push(issue(fragment, 'fragment.empty', '片段没有原子'))
  }

  fragment.atoms.forEach((atom, index) => {
    if (!atom.symbol) issues.push(issue(fragment, 'atom.symbol.empty', `atom[${index}] 缺少元素符号`))
    if (!isFiniteCoord(atom.x) || !isFiniteCoord(atom.y) || !isFiniteCoord(atom.z)) {
      issues.push(issue(fragment, 'atom.coord.invalid', `atom[${index}] 坐标不是有限数`))
    }
  })

  const bondPairs = new Set<string>()
  fragment.bonds.forEach((bond, index) => {
    if (bond.a < 0 || bond.a >= atomCount || bond.b < 0 || bond.b >= atomCount) {
      issues.push(issue(fragment, 'bond.index.invalid', `bond[${index}] 引用了不存在的原子`))
      return
    }
    if (bond.a === bond.b) {
      issues.push(issue(fragment, 'bond.self', `bond[${index}] 是自环`))
    }
    const key = bond.a < bond.b ? `${bond.a}:${bond.b}` : `${bond.b}:${bond.a}`
    if (bondPairs.has(key)) {
      issues.push(issue(fragment, 'bond.duplicate', `bond[${index}] 与已有键重复`))
    }
    bondPairs.add(key)
  })

  if (fragment.attachIndex < 0 || fragment.attachIndex >= atomCount) {
    issues.push(issue(fragment, 'attach.index.invalid', 'attachIndex 引用了不存在的原子'))
  } else if (fragment.atoms[fragment.attachIndex]?.symbol === 'H') {
    issues.push(issue(fragment, 'attach.index.hydrogen', 'attachIndex 不能是 H'))
  }

  const usesEdgeAttachment = fragment.attachBond !== undefined
  const usesExplicitDirection = !usesEdgeAttachment
    && fragment.attachHIndex < 0
    && fragment.attachDirection !== undefined
  if (!usesEdgeAttachment && !usesExplicitDirection) {
    if (fragment.attachHIndex < 0 || fragment.attachHIndex >= atomCount) {
      issues.push(issue(fragment, 'attach.h.index.invalid', 'attachHIndex 引用了不存在的原子'))
    } else if (fragment.atoms[fragment.attachHIndex]?.symbol !== 'H') {
      issues.push(issue(fragment, 'attach.h.not_hydrogen', 'attachHIndex 必须指向 H'))
    }
  }

  if (
    fragment.attachIndex >= 0 && fragment.attachIndex < atomCount &&
    !usesEdgeAttachment && !usesExplicitDirection &&
    fragment.attachHIndex >= 0 && fragment.attachHIndex < atomCount &&
    !bondPairs.has(fragment.attachIndex < fragment.attachHIndex
      ? `${fragment.attachIndex}:${fragment.attachHIndex}`
      : `${fragment.attachHIndex}:${fragment.attachIndex}`)
  ) {
    issues.push(issue(fragment, 'attach.axis.missing_bond', 'attachIndex 与 attachHIndex 之间没有键'))
  }

  if (fragment.attachBond) {
    const [a, b] = fragment.attachBond
    if (a < 0 || a >= atomCount || b < 0 || b >= atomCount) {
      issues.push(issue(fragment, 'attach.bond.index.invalid', 'attachBond 引用了不存在的原子'))
    } else {
      if (a === b) issues.push(issue(fragment, 'attach.bond.self', 'attachBond 不能是自环'))
      if (fragment.atoms[a]?.symbol === 'H' || fragment.atoms[b]?.symbol === 'H') {
        issues.push(issue(fragment, 'attach.bond.hydrogen', 'attachBond 两端必须是重原子'))
      }
      const key = a < b ? `${a}:${b}` : `${b}:${a}`
      if (!bondPairs.has(key)) {
        issues.push(issue(fragment, 'attach.bond.missing', 'attachBond 两端没有模板键'))
      }
    }
  }

  if (fragment.coordination) {
    if (fragment.group !== 'coordination') {
      issues.push(issue(fragment, 'coordination.group.invalid', '配位构型片段必须使用 coordination 分组'))
    }
    if (fragment.coordination.coordinationNumber !== fragment.coordination.directions.length) {
      issues.push(issue(fragment, 'coordination.count.mismatch', '配位数与方向数量不一致'))
    }
    if (fragment.coordination.coordinationNumber !== fragment.coordination.sites.length) {
      issues.push(issue(fragment, 'coordination.sites.count.mismatch', '配位数与位点数量不一致'))
    }
    const siteIds = new Set<string>()
    fragment.coordination.sites.forEach((site, index) => {
      if (!site.id.trim() || siteIds.has(site.id)) {
        issues.push(issue(fragment, 'coordination.site.id.invalid', `coordination site[${index}] ID 为空或重复`))
      }
      siteIds.add(site.id)
      if (!site.equivalenceGroup.trim()) {
        issues.push(issue(fragment, 'coordination.site.group.invalid', `coordination site[${index}] 缺少等价组`))
      }
      if (site.bondOrder !== 1 && site.bondOrder !== 2 && site.bondOrder !== 3) {
        issues.push(issue(fragment, 'coordination.site.order.invalid', `coordination site[${index}] 键级无效`))
      }
    })
    fragment.coordination.directions.forEach((direction, index) => {
      if (direction.length !== 3 || direction.some(value => !Number.isFinite(value))) {
        issues.push(issue(fragment, 'coordination.direction.invalid', `coordination direction[${index}] 不是有效三维向量`))
      }
      const magnitude = Math.hypot(direction[0] ?? 0, direction[1] ?? 0, direction[2] ?? 0)
      if (magnitude < 0.999 || magnitude > 1.001) {
        issues.push(issue(fragment, 'coordination.direction.not_unit', `coordination direction[${index}] 不是单位向量`))
      }
    })
  }

  return issues
}

export function validateFragmentLibrary(fragments: readonly FragmentDef[]): FragmentValidationIssue[] {
  const issues: FragmentValidationIssue[] = []
  const ids = new Set<string>()
  for (const fragment of fragments) {
    if (ids.has(fragment.id)) {
      issues.push(issue(fragment, 'fragment.id.duplicate', `重复片段 id: ${fragment.id}`))
    }
    ids.add(fragment.id)
    issues.push(...validateFragmentDef(fragment))
  }
  return issues
}
