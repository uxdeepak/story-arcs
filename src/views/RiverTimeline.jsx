import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import useInView from '../hooks/useInView.js'
import { storyArcs, loosePhotos, totalPhotos } from '../data/demoData.js'
import StoryIsland from '../components/StoryIsland.jsx'
import Minimap from '../components/Minimap.jsx'
import ConnectionThreads from '../components/ConnectionThreads.jsx'
import DensityStrip from '../components/DensityStrip.jsx'
import MoodRiver from '../components/MoodRiver.jsx'
import LoosePhotoMarkers from '../components/LoosePhotoMarkers.jsx'
import useTimelineScroll from '../hooks/useTimelineScroll.js'

// ─── Layout constants ────────────────────────────────────────────────
const MONTH_WIDTH = 300
const TOTAL_WIDTH = MONTH_WIDTH * 12 + 200
const ISLAND_BASE_W = 180
const ISLAND_PER_PHOTO_W = 16
const ISLAND_MAX_W = 340
const ISLAND_HEIGHT = 190
const ISLAND_GAP_FROM_RIVER = 28
const OVERLAP_OFFSET_Y = 210
const PADDING_LEFT = 100

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const YEAR_START = new Date('2024-01-01').getTime()
const YEAR_END = new Date('2024-12-31T23:59:59').getTime()
const YEAR_MS = YEAR_END - YEAR_START

function dateToX(dateStr) {
  const ms = new Date(dateStr).getTime() - YEAR_START
  return PADDING_LEFT + (ms / YEAR_MS) * (TOTAL_WIDTH - PADDING_LEFT * 2)
}

function storyMidX(story) {
  const startMs = new Date(story.dateRange.start).getTime()
  const endMs = new Date(story.dateRange.end).getTime()
  const midMs = startMs + (endMs - startMs) / 2
  return dateToX(new Date(midMs).toISOString())
}

// ─── Compute island positions with overlap stacking ──────────────────
function computeIslandLayout(stories) {
  const sorted = [...stories]
    .map((s, originalIndex) => ({ story: s, originalIndex }))
    .sort((a, b) => new Date(a.story.dateRange.start) - new Date(b.story.dateRange.start))

  const positions = []
  const rows = { above: [], below: [] }

  sorted.forEach(({ story, originalIndex }, sortedIndex) => {
    const width = Math.min(ISLAND_BASE_W + story.photos.length * ISLAND_PER_PHOTO_W, ISLAND_MAX_W)
    const midX = storyMidX(story)
    const x = midX - width / 2

    const preferredSide = sortedIndex % 2 === 0 ? 'above' : 'below'

    const checkOverlap = (side) => {
      let level = 0
      for (const placed of rows[side]) {
        if (x < placed.x2 + 16 && x + width > placed.x1 - 16) {
          level = Math.max(level, placed.level + 1)
        }
      }
      return level
    }

    const preferredLevel = checkOverlap(preferredSide)
    const alternateSide = preferredSide === 'above' ? 'below' : 'above'
    const alternateLevel = checkOverlap(alternateSide)

    let side, level
    if (preferredLevel <= alternateLevel) {
      side = preferredSide
      level = preferredLevel
    } else {
      side = alternateSide
      level = alternateLevel
    }

    rows[side].push({ x1: x, x2: x + width, level })

    positions.push({ story, originalIndex, x, width, side, level })
  })

  return positions
}

// ─── Find gaps between stories for dashed river segments ─────────────
function findGaps(stories) {
  // Get non-overlapping "active" story periods sorted by start
  const periods = stories
    .map((s) => ({
      start: new Date(s.dateRange.start).getTime(),
      end: new Date(s.dateRange.end).getTime(),
    }))
    .sort((a, b) => a.start - b.start)

  // Merge overlapping periods
  const merged = []
  for (const p of periods) {
    if (merged.length && p.start <= merged[merged.length - 1].end + 14 * 24 * 3600 * 1000) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, p.end)
    } else {
      merged.push({ ...p })
    }
  }

  // Gaps are spaces between merged periods (only if > 20 days)
  const gaps = []
  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = merged[i].end
    const gapEnd = merged[i + 1].start
    if (gapEnd - gapStart > 20 * 24 * 3600 * 1000) {
      gaps.push({
        startX: dateToX(new Date(gapStart).toISOString()),
        endX: dateToX(new Date(gapEnd).toISOString()),
      })
    }
  }

  return gaps
}

/**
 * RiverTimeline — the main view showing all story arcs on a horizontal
 * timeline. Stories are positioned as "islands" above/below a mood-colored
 * river line, connected by bezier thread lines.
 */
export default function RiverTimeline() {
  const scrollRef = useRef(null)
  const canvasRef = useRef(null)
  const [canvasHeight, setCanvasHeight] = useState(600)
  const [hoveredStoryId, setHoveredStoryId] = useState(null)
  const [riverDone, setRiverDone] = useState(false)

  const handleRiverDrawComplete = useCallback(() => setRiverDone(true), [])

  const {
    scrollFraction,
    viewportFraction,
    scrollTo,
    startMinimapDrag,
  } = useTimelineScroll(scrollRef, TOTAL_WIDTH)

  const islandLayout = useMemo(() => computeIslandLayout(storyArcs), [])
  const gaps = useMemo(() => findGaps(storyArcs), [])

  // Track canvas height for SVG overlay
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setCanvasHeight(entry.contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Start scrolled to show the first story island
  useEffect(() => {
    const el = scrollRef.current
    if (!el || islandLayout.length === 0) return
    const firstX = Math.min(...islandLayout.map((p) => p.x))
    el.scrollLeft = Math.max(0, firstX - 80)
  }, [islandLayout])

  const [headerRef, headerVisible] = useInView()
  const [footerRef, footerVisible] = useInView()

  const handleIslandHover = useCallback((id) => {
    setHoveredStoryId(id)
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        ref={headerRef}
        className={`flex items-center px-4 lg:px-6 py-3 gap-4 lg:gap-6 shrink-0 fade-in-up ${headerVisible ? 'visible' : ''}`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h1
          className="text-lg lg:text-xl font-semibold tracking-tight whitespace-nowrap"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
        >
          Story Arcs
        </h1>

        <div className={`flex-1 min-w-0 ${riverDone ? '' : 'minimap-fade-in'}`}>
          <Minimap
            stories={storyArcs}
            scrollFraction={scrollFraction}
            viewportFraction={viewportFraction}
            onScrollTo={scrollTo}
            onDragStart={startMinimapDrag}
            totalWidth={TOTAL_WIDTH}
          />
        </div>

        <div className="flex items-center gap-3 lg:gap-4 whitespace-nowrap">
          <span className="text-[11px] lg:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {storyArcs.length} stories
          </span>
          <span className="text-[11px] lg:text-xs hidden sm:inline" style={{ color: 'var(--color-text-secondary)' }}>
            {totalPhotos} photos
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
            }}
          >
            2024
          </span>
        </div>
      </header>

      {/* ── Timeline Canvas ────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative outline-none"
        tabIndex={0}
        role="region"
        aria-label="Timeline — scroll horizontally to explore stories"
      >
        <div
          ref={canvasRef}
          className="relative"
          style={{ width: TOTAL_WIDTH, height: '100%', minHeight: '100%' }}
        >
          {/* ── Mood-colored River Line ──────────────────────────── */}
          <MoodRiver
            stories={storyArcs}
            totalWidth={TOTAL_WIDTH}
            paddingLeft={PADDING_LEFT}
            onDrawComplete={handleRiverDrawComplete}
          />

          {/* ── Gap dashed lines ─────────────────────────────────── */}
          {gaps.map((gap, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: gap.startX,
                width: gap.endX - gap.startX,
                top: 'calc(50%)',
                height: '1px',
                backgroundImage: `repeating-linear-gradient(to right,
                  var(--color-text-muted) 0px,
                  var(--color-text-muted) 4px,
                  transparent 4px,
                  transparent 12px)`,
                opacity: 0.15,
              }}
            />
          ))}

          {/* ── Density Strip ────────────────────────────────────── */}
          <DensityStrip
            stories={storyArcs}
            loosePhotos={loosePhotos}
            totalWidth={TOTAL_WIDTH}
            paddingLeft={PADDING_LEFT}
          />

          {/* ── Month Markers ────────────────────────────────────── */}
          {MONTHS.map((month, i) => {
            const x = PADDING_LEFT + i * MONTH_WIDTH
            return (
              <div key={month} className="absolute" style={{ left: x, top: 0, bottom: 0 }}>
                <div
                  className="absolute"
                  style={{
                    left: 0,
                    top: 'calc(50% - 16px)',
                    width: '1px',
                    height: '32px',
                    backgroundColor: 'var(--color-border)',
                    opacity: 0.5,
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    left: '-2px',
                    top: 'calc(50% - 2px)',
                    width: '5px',
                    height: '5px',
                    backgroundColor: 'var(--color-accent)',
                    opacity: 0.4,
                  }}
                />
                <span
                  className="absolute text-[11px] lg:text-xs font-medium select-none month-label-enter"
                  style={{
                    left: '8px',
                    top: 'calc(50% + 20px)',
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '0.05em',
                    animationDelay: `${1.5 + i * 0.06}s`,
                  }}
                >
                  {month}
                </span>
              </div>
            )
          })}

          {/* ── Loose Photo Markers ──────────────────────────────── */}
          <LoosePhotoMarkers
            loosePhotos={loosePhotos}
            totalWidth={TOTAL_WIDTH}
            paddingLeft={PADDING_LEFT}
          />

          {/* ── Connection Threads (SVG overlay) ─────────────────── */}
          <ConnectionThreads
            stories={storyArcs}
            islandLayout={islandLayout}
            hoveredStoryId={hoveredStoryId}
            islandHeight={ISLAND_HEIGHT}
            riverGapFromRiver={ISLAND_GAP_FROM_RIVER}
            overlapOffsetY={OVERLAP_OFFSET_Y}
            totalWidth={TOTAL_WIDTH}
            canvasHeight={canvasHeight}
          />

          {/* ── Story Islands ────────────────────────────────────── */}
          {islandLayout.map(({ story, originalIndex, x, width, side, level }) => {
            const baseOffset = ISLAND_GAP_FROM_RIVER + ISLAND_HEIGHT / 2
            const stackOffset = level * OVERLAP_OFFSET_Y

            let top
            if (side === 'above') {
              top = `calc(50% - ${baseOffset + stackOffset}px - ${ISLAND_HEIGHT / 2}px)`
            } else {
              top = `calc(50% + ${ISLAND_GAP_FROM_RIVER + stackOffset}px)`
            }

            return (
              <StoryIsland
                key={story.id}
                story={story}
                index={originalIndex}
                onHover={handleIslandHover}
                style={{
                  left: x,
                  top,
                  width,
                  height: ISLAND_HEIGHT,
                }}
              />
            )
          })}

          {/* ── Year label ───────────────────────────────────────── */}
          <div
            className="absolute text-sm font-medium"
            style={{
              left: PADDING_LEFT - 60,
              top: 'calc(50% - 8px)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-serif)',
            }}
          >
            2024
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────── */}
      <div
        ref={footerRef}
        className={`flex items-center justify-between px-4 lg:px-6 py-2 shrink-0 fade-in-up ${footerVisible ? 'visible' : ''}`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <span className="text-[10px] lg:text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          Scroll or ← → to navigate · Click a story to explore
        </span>
        <span className="text-[10px] lg:text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          Story Arcs — Your year in stories
        </span>
      </div>
    </div>
  )
}
