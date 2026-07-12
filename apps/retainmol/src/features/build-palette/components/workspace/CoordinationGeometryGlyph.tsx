interface ProjectedSite {
  readonly x: number
  readonly y: number
  readonly depth: number
}

type BondDepthStyle = 'back' | 'plane' | 'front'

const WIDTH = 52
const HEIGHT = 36
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2
type ViewRotation = readonly [xDegrees: number, yDegrees: number, zDegrees: number]

const VIEW_ROTATIONS: Readonly<Record<string, ViewRotation>> = {
  linear: [0, 0, 0],
  'trigonal-planar': [0, 0, -90],
  't-shaped': [0, 0, 0],
  'trigonal-pyramidal': [0, 0, 0],
  tetrahedral: [0, 0, 22],
  'square-planar': [0, 0, 0],
  'trigonal-bipyramidal': [58, 0, -30],
  'square-pyramidal': [55, 0, 45],
  'octahedral-d3d': [28, 38, 8],
  'trigonal-prismatic-d3h': [56, 0, 30],
  'pentagonal-bipyramidal-d5h': [60, 0, -18],
  'capped-octahedral-c3v': [24, 34, 10],
  'square-antiprismatic-d4d': [52, 18, 22],
  'dodecahedral-d2d': [28, 34, 12],
  'tricapped-trigonal-prismatic-d3h': [54, 12, 30],
  'capped-square-antiprismatic-c4v': [56, 18, 22],
  'pentagonal-prismatic-d5h': [54, 14, 18],
}

export function CoordinationGeometryGlyph({
  symbol,
  directions,
  geometryId,
}: {
  symbol: string
  directions: readonly (readonly [number, number, number])[]
  geometryId: string
}) {
  const sites = projectCoordinationDirections(directions, geometryId)

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="block h-9 w-[52px] overflow-visible"
      aria-hidden="true"
    >
      {sites.map((site, index) => {
        return (
          <StereoBond
            key={`${index}-${site.x.toFixed(2)}-${site.y.toFixed(2)}`}
            site={site}
          />
        )
      })}

      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r="7.2"
        className="fill-card stroke-current"
        strokeWidth="1.25"
      />
      <ellipse
        cx={CENTER_X - 1.8}
        cy={CENTER_Y - 2.1}
        rx="2.2"
        ry="1.35"
        fill="currentColor"
        opacity="0.12"
      />
      <text
        x={CENTER_X}
        y={CENTER_Y + 0.4}
        className="fill-card-foreground text-[8px] font-bold"
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {symbol}
      </text>
    </svg>
  )
}

export function projectCoordinationDirections(
  directions: readonly (readonly [number, number, number])[],
  geometryId = 'default',
): readonly ProjectedSite[] {
  const [rotationX, rotationY, rotationZ] = (VIEW_ROTATIONS[geometryId] ?? [28, 38, 8])
    .map(degrees => degrees * Math.PI / 180) as [number, number, number]
  const cosX = Math.cos(rotationX)
  const sinX = Math.sin(rotationX)
  const cosY = Math.cos(rotationY)
  const sinY = Math.sin(rotationY)
  const cosZ = Math.cos(rotationZ)
  const sinZ = Math.sin(rotationZ)

  return directions
    .map(([x, y, z]) => {
      const pitchY = y * cosX - z * sinX
      const pitchZ = y * sinX + z * cosX
      const yawX = x * cosY + pitchZ * sinY
      const depth = -x * sinY + pitchZ * cosY
      const rotatedX = yawX * cosZ - pitchY * sinZ
      const rotatedY = yawX * sinZ + pitchY * cosZ
      const perspective = 1 + depth * 0.13

      return {
        x: CENTER_X + rotatedX * 14.5 * perspective,
        y: CENTER_Y - rotatedY * 13.2 * perspective,
        depth,
      }
    })
    .sort((left, right) => left.depth - right.depth)
}

export function bondDepthStyle(depth: number): BondDepthStyle {
  if (depth < -0.18) return 'back'
  if (depth > 0.18) return 'front'
  return 'plane'
}

function StereoBond({ site }: { site: ProjectedSite }) {
  const style = bondDepthStyle(site.depth)
  if (style === 'plane') {
    return (
      <line
        x1={CENTER_X}
        y1={CENTER_Y}
        x2={site.x}
        y2={site.y}
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    )
  }

  const dx = site.x - CENTER_X
  const dy = site.y - CENTER_Y
  const length = Math.hypot(dx, dy) || 1
  const perpendicularX = -dy / length
  const perpendicularY = dx / length

  if (style === 'front') {
    const halfWidth = 2.9
    return (
      <path
        d={`M ${CENTER_X} ${CENTER_Y} L ${site.x + perpendicularX * halfWidth} ${site.y + perpendicularY * halfWidth} L ${site.x - perpendicularX * halfWidth} ${site.y - perpendicularY * halfWidth} Z`}
        fill="currentColor"
      />
    )
  }

  return (
    <g opacity="0.82">
      {[0.34, 0.52, 0.7, 0.88].map((progress, index) => {
        const centerX = CENTER_X + dx * progress
        const centerY = CENTER_Y + dy * progress
        const halfWidth = 0.55 + index * 0.48
        return (
          <line
            key={progress}
            x1={centerX - perpendicularX * halfWidth}
            y1={centerY - perpendicularY * halfWidth}
            x2={centerX + perpendicularX * halfWidth}
            y2={centerY + perpendicularY * halfWidth}
            stroke="currentColor"
            strokeWidth="1.05"
            strokeLinecap="round"
          />
        )
      })}
    </g>
  )
}
