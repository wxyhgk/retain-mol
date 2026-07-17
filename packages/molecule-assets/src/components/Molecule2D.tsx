import { useId, useMemo } from 'react'
import { depictMolecule2D } from '@retainmol/mol-viewer/io'
import type { Molecule } from '@retainmol/mol-viewer/io'

export interface Molecule2DProps {
  molecule: Molecule
  width?: number
  height?: number
  className?: string
  /** 无障碍名称；缺省用分子名 */
  label?: string
}

/**
 * 2D 骨架式结构图。SVG 内联渲染；骨架色是 currentColor，
 * 由外层 CSS 的 color 决定（浅/深主题自动跟随），杂原子保留元素色。
 */
export function Molecule2D({ molecule, width = 240, height = 180, className, label }: Molecule2DProps) {
  const rawId = useId()
  const svg = useMemo(
    () => depictMolecule2D(molecule, {
      width,
      height,
      // useId 含 ':'，清洗成合法的 SVG id 前缀，避免同页多图 id 冲突
      id: `m2d${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    }),
    [molecule, width, height, rawId],
  )
  return (
    <div
      role="img"
      aria-label={label ?? molecule.name ?? '分子结构'}
      className={className}
      // SVG 由本地 OCL 生成，非用户输入，内联安全
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
