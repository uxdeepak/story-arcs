import { useMemo, useRef, useEffect } from 'react'

const MOOD_COLORS = {
  warm:     { r: 196, g: 114, b: 78  },  // terracotta
  calm:     { r: 107, g: 138, b: 122 },  // cool blue-grey
  euphoric: { r: 212, g: 160, b: 62  },  // warm amber
}

const DEFAULT_COLOR = { r: 140, g: 120, b: 100 } // neutral warm

const YEAR_START = new Date('2024-01-01').getTime()
const YEAR_END = new Date('2024-12-31T23:59:59').getTime()
const YEAR_MS = YEAR_END - YEAR_START

/**
 * MoodRiver — the central horizontal line on the timeline, colored by a
 * gradient derived from each story's mood (warm/calm/euphoric). Draws itself
 * left-to-right on page load via stroke-dasharray animation.
 */
export default function MoodRiver({ stories, totalWidth, paddingLeft, onDrawComplete, riverY }) {
  const lineRef = useRef(null)
  const glowRef = useRef(null)

  // Sample mood colors at evenly-spaced points along the timeline
  // and build a gradient
  const gradientStops = useMemo(() => {
    const SAMPLES = 24
    const stops = []

    for (let i = 0; i <= SAMPLES; i++) {
      const fraction = i / SAMPLES
      const timeMs = YEAR_START + fraction * YEAR_MS

      // Find stories that overlap this point in time, weighted by proximity
      let totalWeight = 0
      let r = 0, g = 0, b = 0

      for (const story of stories) {
        const startMs = new Date(story.dateRange.start).getTime()
        const endMs = new Date(story.dateRange.end).getTime()
        const midMs = (startMs + endMs) / 2
        const spreadMs = Math.max(endMs - startMs, 30 * 24 * 3600 * 1000) // min 30-day spread

        // Gaussian-ish falloff from story midpoint
        const dist = Math.abs(timeMs - midMs) / spreadMs
        const weight = Math.exp(-dist * dist * 2)

        if (weight > 0.01) {
          const color = MOOD_COLORS[story.mood] || DEFAULT_COLOR
          r += color.r * weight
          g += color.g * weight
          b += color.b * weight
          totalWeight += weight
        }
      }

      if (totalWeight > 0) {
        r = Math.round(r / totalWeight)
        g = Math.round(g / totalWeight)
        b = Math.round(b / totalWeight)
      } else {
        r = DEFAULT_COLOR.r
        g = DEFAULT_COLOR.g
        b = DEFAULT_COLOR.b
      }

      const intensity = Math.min(totalWeight, 1) * 0.5 + 0.15
      stops.push({
        offset: `${fraction * 100}%`,
        color: `rgba(${r},${g},${b},${intensity})`,
      })
    }

    return stops
  }, [stories])

  const riverLength = totalWidth - paddingLeft * 2
  const gradientId = 'mood-river-gradient'
  const glowGradientId = 'mood-river-glow'

  // Fire draw-complete callback after animation
  useEffect(() => {
    const timer = setTimeout(() => onDrawComplete?.(), 1500)
    return () => clearTimeout(timer)
  }, [onDrawComplete])

  return (
    <>
      {/* SVG for gradient definitions */}
      <svg width={0} height={0} className="absolute">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
          <linearGradient id={glowGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((stop, i) => (
              <stop
                key={i}
                offset={stop.offset}
                stopColor={stop.color.replace(/[\d.]+\)$/, '0.08)')}
              />
            ))}
          </linearGradient>
        </defs>
      </svg>

      {/* Main river line — draw animation */}
      <div
        className="absolute left-0 right-0"
        style={{ top: riverY != null ? riverY : '50%', height: '2px' }}
      >
        <svg width={totalWidth} height={2} className="absolute top-0 left-0">
          <line
            ref={lineRef}
            x1={paddingLeft}
            y1={1}
            x2={totalWidth - paddingLeft}
            y2={1}
            stroke={`url(#${gradientId})`}
            strokeWidth={2}
            strokeDasharray={riverLength}
            strokeDashoffset={riverLength}
            className="mood-river-draw"
            style={{ '--river-length': riverLength }}
          />
        </svg>
      </div>

      {/* River glow — fades in with the draw */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ top: riverY != null ? riverY - 14 : 'calc(50% - 14px)', height: '28px' }}
      >
        <svg width={totalWidth} height={28} className="absolute top-0 left-0">
          <rect
            ref={glowRef}
            x={paddingLeft}
            y={0}
            width={riverLength}
            height={28}
            fill={`url(#${glowGradientId})`}
            rx={14}
            style={{
              opacity: 0,
              animation: 'minimap-appear 1s ease-out 0.8s forwards',
            }}
          />
        </svg>
      </div>
    </>
  )
}
