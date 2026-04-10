import { useRef, useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
// Quarter anchors — only these get text labels; others get thin tick marks
const QUARTER_LABELS = [
  { idx: 0, label: 'Jan' },
  { idx: 3, label: 'Apr' },
  { idx: 6, label: 'Jul' },
  { idx: 9, label: 'Oct' },
  { idx: 12, label: 'Dec' },
]

const MOOD_COLORS = {
  warm: '#C4724E',
  calm: '#6B8A7A',
  euphoric: '#D4A03E',
}

const YEAR_START = new Date('2024-01-01').getTime()
const YEAR_END = new Date('2024-12-31').getTime()
const YEAR_MS = YEAR_END - YEAR_START

// Each story marker is a fixed-width pill centered at the story's midpoint.
// This prevents long-duration stories from visually dominating the bar.
const MARKER_WIDTH_PCT = 4 // % of bar width per marker
const MARKER_HIT_EXTRA = 1.5 // extra % padding for easier hover targeting

function formatShortDateRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const opts = { month: 'short', day: 'numeric' }
  if (s.getTime() === e.getTime()) return s.toLocaleDateString('en-US', opts)
  if (s.getMonth() === e.getMonth()) return `${s.toLocaleDateString('en-US', opts)}–${e.getDate()}`
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`
}

export default function Minimap({
  stories,
  scrollFraction,
  viewportFraction,
  onScrollTo,
  onDragStart,
  totalWidth,
}) {
  const barRef = useRef(null)
  const navigate = useNavigate()
  const [hoveredStory, setHoveredStory] = useState(null)
  const [hoverX, setHoverX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverMonth, setHoverMonth] = useState(null)

  // Pre-compute story positions — each story is a fixed-width marker at its midpoint
  const storyPositions = useMemo(() => {
    return stories.map((story) => {
      const startMs = new Date(story.dateRange.start).getTime()
      const endMs = new Date(story.dateRange.end).getTime()
      const midMs = startMs + (endMs - startMs) / 2
      const midPct = ((midMs - YEAR_START) / YEAR_MS) * 100
      const coverPhoto = story.photos[story.coverPhotoIndex] || story.photos[0]
      return {
        story,
        midPct,
        color: MOOD_COLORS[story.mood] || MOOD_COLORS.warm,
        coverUrl: coverPhoto?.url,
        photoCount: story.photos.length,
      }
    })
  }, [stories])

  const handleClick = useCallback(
    (e) => {
      if (hoveredStory) {
        navigate(`/story/${hoveredStory.id}`)
        return
      }
      const rect = barRef.current.getBoundingClientRect()
      const fraction = (e.clientX - rect.left) / rect.width
      onScrollTo(fraction * totalWidth)
    },
    [onScrollTo, totalWidth, hoveredStory, navigate]
  )

  const handleMouseDown = useCallback(
    (e) => {
      if (!barRef.current) return
      const rect = barRef.current.getBoundingClientRect()
      setIsDragging(true)

      const origOnUp = () => setIsDragging(false)
      window.addEventListener('mouseup', origOnUp, { once: true })

      onDragStart(e, rect.width)
    },
    [onDragStart]
  )

  const handleMouseMove = useCallback(
    (e) => {
      if (!barRef.current || isDragging) {
        setHoveredStory(null)
        setHoverMonth(null)
        return
      }
      const rect = barRef.current.getBoundingClientRect()
      const fraction = (e.clientX - rect.left) / rect.width
      const xPct = fraction * 100
      setHoverX(e.clientX - rect.left)

      // Hit-test: find the nearest story marker within hit range
      let found = null
      let bestDist = Infinity
      const hitHalf = MARKER_WIDTH_PCT / 2 + MARKER_HIT_EXTRA
      for (const sp of storyPositions) {
        const dist = Math.abs(xPct - sp.midPct)
        if (dist <= hitHalf && dist < bestDist) {
          bestDist = dist
          found = sp.story
        }
      }

      if (found) {
        setHoveredStory(found)
        setHoverMonth(null)
      } else {
        setHoveredStory(null)
        const monthIdx = Math.min(Math.floor(fraction * 12), 11)
        setHoverMonth(monthIdx >= 0 ? monthIdx : null)
      }
    },
    [storyPositions, isDragging]
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredStory(null)
    setHoverMonth(null)
  }, [])

  const viewLeft = scrollFraction * 100
  const viewWidth = Math.min(viewportFraction * 100, 100)

  const hoveredCover = hoveredStory
    ? storyPositions.find((sp) => sp.story.id === hoveredStory.id)?.coverUrl
    : null

  // ── Layout constants for the unified timeline strip ──
  const STRIP_HEIGHT = 48
  const AXIS_Y = 22 // y-position of the horizontal axis line within the strip
  const MARKER_RADIUS = 5

  return (
    <div className="flex flex-col flex-1 min-w-0 max-w-[560px]">
      {/* Unified timeline strip */}
      <div
        ref={barRef}
        className="relative overflow-visible"
        style={{
          height: STRIP_HEIGHT,
          cursor: hoveredStory ? 'pointer' : 'default',
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Horizontal axis line */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: AXIS_Y,
            height: 2,
            backgroundColor: 'var(--color-border)',
            borderRadius: 1,
          }}
        />
        {/* Axis end caps */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: AXIS_Y - 4,
            width: 2,
            height: 10,
            backgroundColor: 'var(--color-text-muted)',
            borderRadius: 1,
          }}
        />
        <div
          className="absolute"
          style={{
            right: 0,
            top: AXIS_Y - 4,
            width: 2,
            height: 10,
            backgroundColor: 'var(--color-text-muted)',
            borderRadius: 1,
          }}
        />

        {/* Month tick marks descending from the axis */}
        {MONTHS.map((_, i) => {
          if (i === 0) return null // start cap already drawn
          const isQuarter = i % 3 === 0
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${(i / 12) * 100}%`,
                top: AXIS_Y + 2,
                width: 1,
                height: isQuarter ? 8 : 4,
                backgroundColor: 'var(--color-text-muted)',
                opacity: isQuarter ? 0.85 : 0.4,
              }}
            />
          )
        })}

        {/* Quarter labels below the axis */}
        {QUARTER_LABELS.map(({ idx, label }) => {
          const isLast = idx === 12
          return (
            <span
              key={idx}
              className="absolute text-[10px] font-medium select-none"
              style={{
                left: `${(idx / 12) * 100}%`,
                top: AXIS_Y + 14,
                transform: isLast ? 'translateX(-100%)' : 'translateX(0)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1,
                letterSpacing: '0.04em',
              }}
            >
              {label}
            </span>
          )
        })}

        {/* Story markers — circular dots sitting ON the axis line */}
        {storyPositions.map(({ story, midPct, color, photoCount }) => {
          const isHovered = hoveredStory?.id === story.id
          const r = MARKER_RADIUS + Math.min(photoCount / 6, 2.5)
          return (
            <div key={story.id}>
              {/* Stem connecting marker to axis */}
              <div
                className="absolute"
                style={{
                  left: `${midPct}%`,
                  top: AXIS_Y - 6,
                  width: 1.5,
                  height: 6,
                  marginLeft: -0.75,
                  backgroundColor: color,
                  opacity: isHovered ? 1 : 0.55,
                  transition: 'opacity 150ms ease',
                }}
              />
              {/* Dot */}
              <div
                className="absolute rounded-full"
                style={{
                  left: `${midPct}%`,
                  top: AXIS_Y - 6 - r * 2,
                  width: r * 2,
                  height: r * 2,
                  marginLeft: -r,
                  backgroundColor: color,
                  opacity: isHovered ? 1 : 0.85,
                  transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                  transformOrigin: 'center bottom',
                  transition: 'opacity 150ms ease, transform 150ms ease',
                  boxShadow: isHovered ? `0 2px 8px ${color}88` : 'none',
                  zIndex: isHovered ? 5 : 2,
                }}
              />
            </div>
          )
        })}

        {/* Viewport indicator — vertical bracket spanning the strip */}
        <div
          className="absolute"
          style={{
            left: `${viewLeft}%`,
            width: `${viewWidth}%`,
            minWidth: '10px',
            top: AXIS_Y - 14,
            height: 28,
            border: isDragging
              ? '1.5px solid var(--color-accent)'
              : '1.5px solid var(--color-text-primary)',
            borderRadius: 4,
            opacity: isDragging ? 0.85 : 0.55,
            backgroundColor: isDragging ? 'var(--color-accent-subtle)' : 'rgba(255,255,255,0.04)',
            transition: 'border-color 150ms ease, opacity 150ms ease, background-color 150ms ease',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />

        {/* Draggable handle */}
        <div
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: `${viewLeft}%`,
            width: `${viewWidth}%`,
            minWidth: '10px',
            top: AXIS_Y - 14,
            height: 28,
            zIndex: 4,
          }}
          onMouseDown={handleMouseDown}
        />

        {/* Hover tooltip */}
        {(hoveredStory || hoverMonth !== null) && !isDragging && (
          <div
            className="absolute top-full mt-2 pointer-events-none"
            style={{
              left: Math.max(8, Math.min(hoverX, (barRef.current?.offsetWidth || 400) - 8)),
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            {/* Arrow */}
            <div
              className="mx-auto"
              style={{
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '5px solid var(--color-border)',
              }}
            />
            <div
              className="rounded-lg overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-tooltip)',
                minWidth: hoveredStory ? 180 : undefined,
              }}
            >
              {hoveredStory ? (
                <div>
                  {hoveredCover && (
                    <div className="relative" style={{ height: 72 }}>
                      <img
                        src={hoveredCover}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ display: 'block' }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(to top, var(--color-surface-elevated) 0%, transparent 60%)',
                        }}
                      />
                    </div>
                  )}
                  <div className="px-2.5 pb-2 pt-1" style={{ marginTop: hoveredCover ? -16 : 0, position: 'relative' }}>
                    <p
                      className="text-[13px] font-semibold leading-tight"
                      style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}
                    >
                      {hoveredStory.title}
                    </p>
                    <p className="text-[13px] leading-tight mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatShortDateRange(hoveredStory.dateRange.start, hoveredStory.dateRange.end)}
                      <span style={{ margin: '0 3px' }}>·</span>
                      {hoveredStory.photos.length} photos
                    </p>
                    {hoveredStory.people.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {hoveredStory.people.map((p) => (
                          <span
                            key={p}
                            className="text-[14px] px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--color-accent-subtle)',
                              color: 'var(--color-accent)',
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[14px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      Click to open
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-2.5 py-1.5">
                  <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][hoverMonth]}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
