import {
  bondDepthStyle,
  projectCoordinationDirections,
  type ProjectedCoordinationSite,
} from './coordinationGeometryProjection'

const WIDTH = 52
const HEIGHT = 36
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2

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

function StereoBond({ site }: { site: ProjectedCoordinationSite }) {
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
