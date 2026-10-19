/**
 * 2D 骨架式结构图生成：Molecule → SVG 字符串。
 * 底层 OCL：inventCoordinates 重新计算干净的 2D 布局（忽略 3D 坐标），toSVG 出图。
 */

import type { Molecule } from '../molecule'
import { moleculeToOCL } from './molFormat'

export interface DepictMolecule2DOptions {
  width?: number
  height?: number
  /** svg 元素的 id 前缀（默认 'mol2d'；同页多图时传唯一值避免 id 冲突） */
  id?: string
  /** 把黑色骨架替换为 currentColor，由 CSS color 控制主题（默认 true） */
  themeAware?: boolean
  /** 移除显式氢（骨架式惯例；本项目分子价态完整、氢是显式原子，默认 true） */
  suppressHydrogens?: boolean
}

const EMPTY_SVG = (width: number, height: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"></svg>`

export function depictMolecule2D(mol: Molecule, options: DepictMolecule2DOptions = {}): string {
  const {
    width = 240,
    height = 180,
    id = 'mol2d',
    themeAware = true,
    suppressHydrogens = true,
  } = options

  if (mol.atoms.length === 0) return EMPTY_SVG(width, height)

  const oclMol = moleculeToOCL(mol)
  if (suppressHydrogens) oclMol.removeExplicitHydrogens()
  oclMol.inventCoordinates()
  let svg = oclMol.toSVG(width, height, id, {
    suppressChiralText: true,
    autoCrop: true,
    autoCropMargin: 8,
  })

  if (themeAware) {
    // OCL 输出黑色骨架/标签；换成 currentColor 后浅深主题都能由外层 CSS 控制，
    // 杂原子的元素配色（红 O、蓝 N…）保持不动。
    svg = svg
      .replace(/rgb\(0,0,0\)/g, 'currentColor')
      .replace(/#000000/gi, 'currentColor')
      .replace(/"black"/g, '"currentColor"')
  }
  return svg
}
