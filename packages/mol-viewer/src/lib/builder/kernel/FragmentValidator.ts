import type { FragmentDef } from '../fragment/model'
import { getElementConfig } from '../../../config/elements.config'

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

interface TemplateBondCapacity {
  readonly count: number
  readonly order: number
}

const HYBRID_SLOT_CAPACITY = {
  sp: 2,
  sp2: 3,
  sp3: 4,
} as const

function templateBondCapacity(
  fragment: FragmentDef,
  atomIndex: number,
): TemplateBondCapacity {
  const atom = fragment.atoms[atomIndex]
  const elementCapacity = getElementConfig(atom?.symbol ?? '').maxBonds
  if (atomIndex !== fragment.attachIndex) {
    return { count: elementCapacity, order: elementCapacity }
  }

  if (fragment.coordination) {
    return {
      count: fragment.coordination.coordinationNumber,
      order: fragment.coordination.sites.reduce((sum, site) => sum + site.bondOrder, 0),
    }
  }

  const hybridCapacity = fragment.group === 'sp'
    || fragment.group === 'sp2'
    || fragment.group === 'sp3'
    ? HYBRID_SLOT_CAPACITY[fragment.group]
    : undefined
  if (hybridCapacity !== undefined && atom?.symbol !== 'H' && elementCapacity > 0) {
    const capacity = Math.max(elementCapacity, hybridCapacity)
    return { count: capacity, order: capacity }
  }

  return { count: elementCapacity, order: elementCapacity }
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
  const bondCounts = Array.from({ length: atomCount }, () => 0)
  const bondOrders = Array.from({ length: atomCount }, () => 0)
  fragment.bonds.forEach((bond, index) => {
    if (bond.a < 0 || bond.a >= atomCount || bond.b < 0 || bond.b >= atomCount) {
      issues.push(issue(fragment, 'bond.index.invalid', `bond[${index}] 引用了不存在的原子`))
      return
    }
    if (bond.a === bond.b) {
      issues.push(issue(fragment, 'bond.self', `bond[${index}] 是自环`))
    }
    if (bond.order !== 1 && bond.order !== 2 && bond.order !== 3) {
      issues.push(issue(fragment, 'bond.order.invalid', `bond[${index}] 键级无效`))
    }
    const key = bond.a < bond.b ? `${bond.a}:${bond.b}` : `${bond.b}:${bond.a}`
    if (bondPairs.has(key)) {
      issues.push(issue(fragment, 'bond.duplicate', `bond[${index}] 与已有键重复`))
    }
    bondPairs.add(key)
    if (bond.a !== bond.b) {
      bondCounts[bond.a] = (bondCounts[bond.a] ?? 0) + 1
      bondCounts[bond.b] = (bondCounts[bond.b] ?? 0) + 1
      bondOrders[bond.a] = (bondOrders[bond.a] ?? 0) + bond.order
      bondOrders[bond.b] = (bondOrders[bond.b] ?? 0) + bond.order
    }
  })

  fragment.atoms.forEach((atom, index) => {
    const capacity = templateBondCapacity(fragment, index)
    if ((bondCounts[index] ?? 0) > capacity.count || (bondOrders[index] ?? 0) > capacity.order) {
      issues.push(issue(
        fragment,
        'atom.valence.exceeded',
        `atom[${index}] ${atom.symbol} 的模板价态超过上限`,
      ))
    }
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

  if (fragment.bridgeAttachment) {
    const { centerIndex, sites } = fragment.bridgeAttachment
    const center = fragment.atoms[centerIndex]
    if (!center) {
      issues.push(issue(fragment, 'bridge.center.invalid', 'bridgeAttachment.centerIndex 引用了不存在的原子'))
    } else if (center.symbol === 'H') {
      issues.push(issue(fragment, 'bridge.center.hydrogen', 'bridgeAttachment 中心不能是 H'))
    }
    if (sites.length !== 2) {
      issues.push(issue(fragment, 'bridge.sites.count', 'bridgeAttachment 必须声明两个有序位点'))
    }
    if (sites[0]?.leavingHydrogenIndex === sites[1]?.leavingHydrogenIndex) {
      issues.push(issue(fragment, 'bridge.sites.duplicate', 'bridgeAttachment 的两个离去 H 不能相同'))
    }

    const directions: [number, number, number][] = []
    let finalCenterValence = bondOrders[centerIndex] ?? 0
    sites.forEach((site, index) => {
      const leaving = fragment.atoms[site.leavingHydrogenIndex]
      if (!leaving) {
        issues.push(issue(fragment, 'bridge.site.index.invalid', `bridge site[${index}] 引用了不存在的原子`))
        return
      }
      if (leaving.symbol !== 'H') {
        issues.push(issue(fragment, 'bridge.site.not_hydrogen', `bridge site[${index}] 必须指向 H`))
      }
      const leavingBond = fragment.bonds.find(bond => (
        (bond.a === centerIndex && bond.b === site.leavingHydrogenIndex)
        || (bond.b === centerIndex && bond.a === site.leavingHydrogenIndex)
      ))
      if (!leavingBond) {
        issues.push(issue(fragment, 'bridge.site.missing_bond', `bridge site[${index}] 与中心没有模板键`))
        return
      }
      if (site.order !== 1 && site.order !== 2 && site.order !== 3) {
        issues.push(issue(fragment, 'bridge.site.order.invalid', `bridge site[${index}] 键级无效`))
      }
      finalCenterValence += site.order - leavingBond.order
      if (center) directions.push([
        leaving.x - center.x,
        leaving.y - center.y,
        leaving.z - center.z,
      ])
    })
    if (center && finalCenterValence > templateBondCapacity(fragment, centerIndex).order) {
      issues.push(issue(fragment, 'bridge.center.valence.exceeded', 'bridgeAttachment 应用后中心价态超过上限'))
    }
    if (directions.length === 2) {
      const [a, b] = directions
      if (a && b) {
        const crossLength = Math.hypot(
          a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0],
        )
        if (crossLength < 1e-8) {
          issues.push(issue(fragment, 'bridge.sites.collinear', 'bridgeAttachment 的两个位点方向不能共线'))
        }
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
