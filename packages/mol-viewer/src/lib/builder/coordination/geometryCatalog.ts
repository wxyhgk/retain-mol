import type { CoordinationGeometryId, CoordinationGeometryTemplate } from './types'

type V3 = readonly [number, number, number]

const normalize = ([x, y, z]: V3): V3 => {
  const length = Math.hypot(x, y, z) || 1
  return [x / length, y / length, z / length]
}

const ring = (count: number, z = 0, offset = 0): V3[] => Array.from({ length: count }, (_, index) => {
  const angle = offset + index * Math.PI * 2 / count
  return normalize([Math.cos(angle), Math.sin(angle), z])
})

const tetrahedral = [
  normalize([1, 1, 1]),
  normalize([1, -1, -1]),
  normalize([-1, 1, -1]),
  normalize([-1, -1, 1]),
] as const

const octahedral = [
  [1, 0, 0], [-1, 0, 0],
  [0, 1, 0], [0, -1, 0],
  [0, 0, 1], [0, 0, -1],
] as const satisfies readonly V3[]

const trigonalPrism = [...ring(3, 0.72), ...ring(3, -0.72)]
const squareAntiprism = [...ring(4, 0.72, Math.PI / 4), ...ring(4, -0.72)]
const pentagonalPrism = [...ring(5, 0.72), ...ring(5, -0.72)]

function template(
  id: CoordinationGeometryId,
  name: string,
  short: string,
  coordinationNumber: number,
  pointGroup: string | undefined,
  directions: readonly V3[],
): CoordinationGeometryTemplate {
  return { id, name, short, coordinationNumber, pointGroup, directions }
}

export const COORDINATION_GEOMETRY_CATALOG: Readonly<Record<CoordinationGeometryId, CoordinationGeometryTemplate>> = {
  linear: template('linear', '直线形', 'L2', 2, 'D∞h', [[1, 0, 0], [-1, 0, 0]]),
  'trigonal-planar': template('trigonal-planar', '平面三角形', 'L3', 3, 'D3h', ring(3)),
  't-shaped': template('t-shaped', 'T 形', 'L3', 3, 'C2v', [[1, 0, 0], [-1, 0, 0], [0, 1, 0]]),
  'trigonal-pyramidal': template('trigonal-pyramidal', '三角锥形', 'L3', 3, 'C3v', tetrahedral.slice(0, 3)),
  tetrahedral: template('tetrahedral', '四面体', 'L4', 4, 'Td', tetrahedral),
  'square-planar': template('square-planar', '平面正方形', 'L4', 4, 'D4h', [[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]]),
  'trigonal-bipyramidal': template('trigonal-bipyramidal', '三角双锥', 'L5', 5, 'D3h', [[0, 0, 1], [0, 0, -1], ...ring(3)]),
  'square-pyramidal': template('square-pyramidal', '四方锥', 'L5', 5, 'C4v', [[0, 0, 1], ...ring(4)]),
  'octahedral-d3d': template('octahedral-d3d', '八面体', 'L6', 6, 'D3d', octahedral),
  'trigonal-prismatic-d3h': template('trigonal-prismatic-d3h', '三角棱柱', 'L6', 6, 'D3h', trigonalPrism),
  'pentagonal-bipyramidal-d5h': template('pentagonal-bipyramidal-d5h', '五角双锥', 'L7', 7, 'D5h', [[0, 0, 1], [0, 0, -1], ...ring(5)]),
  'capped-octahedral-c3v': template('capped-octahedral-c3v', '单帽八面体', 'L7', 7, 'C3v', [...octahedral, normalize([1, 1, 1])]),
  'square-antiprismatic-d4d': template('square-antiprismatic-d4d', '四方反棱柱', 'L8', 8, 'D4d', squareAntiprism),
  'dodecahedral-d2d': template('dodecahedral-d2d', '十二面体', 'L8', 8, 'D2d', [
    normalize([1, 1, 0.55]), normalize([-1, 1, 0.55]), normalize([-1, -1, 0.55]), normalize([1, -1, 0.55]),
    normalize([0.55, 1, -1]), normalize([-0.55, 1, -1]), normalize([-0.55, -1, -1]), normalize([0.55, -1, -1]),
  ]),
  'tricapped-trigonal-prismatic-d3h': template('tricapped-trigonal-prismatic-d3h', '三帽三角棱柱', 'L9', 9, 'D3h', [...trigonalPrism, ...ring(3, 0, Math.PI / 3)]),
  'capped-square-antiprismatic-c4v': template('capped-square-antiprismatic-c4v', '单帽四方反棱柱', 'L9', 9, 'C4v', [...squareAntiprism, [0, 0, 1]]),
  'pentagonal-prismatic-d5h': template('pentagonal-prismatic-d5h', '五角棱柱', 'L10', 10, 'D5h', pentagonalPrism),
}

export const TRANSITION_METAL_COORDINATION_GEOMETRY_IDS = Object.freeze(
  Object.keys(COORDINATION_GEOMETRY_CATALOG) as CoordinationGeometryId[],
)
