import { useRef, useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const MOOD_COLORS = {
  warm: '#C4724E',
  calm: '#6B8A7A',
  euphoric: '#D4A03E',
}

const YEAR_START = new Date('2024-01-01').getTime()
const YEAR_END = new Date('2024-12-31').getTime()
const YEAR_MS = YEAR_END - YEAR_START

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

  // Pre-compute story positions for hit-testing (sorted narrowest-first so
  // short stories are found before year-spanning arcs that overlap them)
  const storyPositions = useMemo(() => {
    return stories
      .map((story) => {
        const startMs = new Date(story.dateRange.start).getTime()
        const endMs = new Date(story.dateRange.end).getTime()
        const leftPct = (startMs - YEAR_START) / YEAR_MS
        const widthPct = Math.max((endMs - startMs) / YEAR_MS, 0.008)
        const coverPhoto = story.photos[story.coverPhotoIndex] || story.photos[0]
        return { story, leftPct, widthPct, color: MOOD_COLORS[story.mood] || MOOD_COLORS.warm, coverUrl: coverPhoto?.url }
      })
      .sort((a, b) => a.widthPct - b.widthPct)
  }, [stories])

  const handleClick = useCallback(
    (e) => {
      // If clicking on a story segment, navigate to that story
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

      // Hit-test story segments
      let found = null
      for (const sp of storyPositions) {
        const segLeft = sp.leftPct * 100
        const segRight = segLeft + sp.widthPct * 100
        if (xPct >= segLeft - 0.5 && xPct <= segRight + 0.5) {
          found = sp.story
          break
        }
      }

      if (found) {
        setHoveredStory(found)
        setHoverMonth(null)
      } else {
        setHoveredStory(null)
        // Show month label
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

  // Find the hovered story's cover URL for tooltip
  const hoveredCover = hoveredStory
    ? storyPositions.find((sp) => sp.story.id === hoveredStory.id)?.coverUrl
    : null

  return (
    <div className="flex flex-col gap-0.5 flex-1 min-w-0 max-w-[560px]">
      {/* Main bar */}
      <div
        ref={barRef}
        className="relative rounded-full overflow-visible"
        style={{
          backgroundColor: 'var(--color-surface)',
          height: isDragging ? 28 : 24,
          transition: 'height 200ms ease',
          cursor: hoveredStory ? 'pointer' : 'default',
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Rounded clip container for internal elements */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Month tick marks */}
          {MONTHS.map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full"
              style={{
                left: `${(i / 12) * 100}%`,
                width: '1px',
                backgroundColor: 'var(--color-border)',
                opacity: 0.4,
              }}
            />
          ))}

          {/* Story segments */}
          {storyPositions.map(({ story, leftPct, widthPct, color }) => {
            const isHovered = hoveredStory?.id === story.id
            return (
              <div
                key={story.id}
                className="absolute rounded-full"
                style={{
                  left: `${leftPct * 100}%`,
                  width: `${widthPct * 100}%`,
                  minWidth: '4px',
                  top: isHovered ? 2 : 4,
                  bottom: isHovered ? 2 : 4,
                  backgroundColor: color,
                  opacity: isHovered ? 1 : 0.7,
                  transition: 'opacity 150ms ease, top 150ms ease, bottom 150ms ease',
                  zIndex: isHovered ? 2 : 1,
                }}
              />
            )
          })}

          {/* Viewport indicator */}
          <div
            className="absolute rounded-full"
            style={{
              left: `${viewLeft}%`,
              width: `${viewWidth}%`,
              minWidth: '8px',
              top: 0,
              bottom: 0,
              border: isDragging
                ? '2px solid var(--color-accent)'
                : '1.5px solid var(--color-text-primary)',
              opacity: isDragging ? 0.8 : 0.5,
              backgroundColor: isDragging ? 'var(--color-accent-subtle)' : 'transparent',
              transition: 'border-color 150ms ease, opacity 150ms ease, background-color 150ms ease',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        </div>

        {/* Draggable handle (over the viewport indicator) */}
        <div
          className="absolute top-0 h-full cursor-grab active:cursor-grabbing"
          style={{
            left: `${viewLeft}%`,
            width: `${viewWidth}%`,
            minWidth: '8px',
            zIndex: 4,
          }}
          onMouseDown={handleMouseDown}
        />

        {/* Hover tooltip — below the minimap */}
        {(hoveredStory || hoverMonth !== null) && !isDragging && (
          <div
            className="absolute top-full mt-2 pointer-events-none"
            style={{
              left: Math.max(8, Math.min(hoverX, (barRef.current?.offsetWidth || 400) - 8)),
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            {/* Tooltip arrow */}
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
                  {/* Cover photo preview */}
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
                      className="text-[11px] font-semibold leading-tight"
                      style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}
                    >
                      {hoveredStory.title}
                    </p>
                    <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatShortDateRange(hoveredStory.dateRange.start, hoveredStory.dateRange.end)}
                      <span style={{ margin: '0 3px' }}>·</span>
                      {hoveredStory.photos.length} photos
                    </p>
                    {hoveredStory.people.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {hoveredStory.people.map((p) => (
                          <span
                            key={p}
                            className="text-[9px] px-1.5 py-0.5 rounded-full"
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
                    <p className="text-[9px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      Click to open
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-2.5 py-1.5">
                  <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][hoverMonth]}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Month labels below the bar */}
      <div className="relative flex-1 min-w-0" style={{ height: 10 }}>
        {MONTHS.map((label, i) => (
          <span
            key={i}
            className="absolute text-[8px] select-none"
            style={{
              left: `${((i + 0.5) / 12) * 100}%`,
              transform: 'translateX(-50%)',
              color: 'var(--color-text-muted)',
              lineHeight: 1,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
