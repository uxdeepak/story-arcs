import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useInView from '../hooks/useInView.js'
import { storyArcs, loosePhotos, totalPhotos } from '../data/demoData.js'
import StoryIsland, { getIslandHeight } from '../components/StoryIsland.jsx'
import Minimap from '../components/Minimap.jsx'
import ConnectionThreads from '../components/ConnectionThreads.jsx'
import MoodRiver from '../components/MoodRiver.jsx'
import LoosePhotoMarkers from '../components/LoosePhotoMarkers.jsx'
import ZoomControls from '../components/ZoomControls.jsx'
import useTimelineScroll from '../hooks/useTimelineScroll.js'
import useTimelineZoom from '../hooks/useTimelineZoom.js'

// ─── Base layout constants (at zoom multiplier 1.0) ─────────────────
const BASE_MONTH_WIDTH = 300
const BASE_TOTAL_WIDTH = BASE_MONTH_WIDTH * 12 + 200
const BASE_GAP_FROM_RIVER = 44
const BASE_PADDING_LEFT = 100

// Width strategies per zoom level — each level has different card sizes
const ISLAND_WIDTH_CONFIG = [
  // Level 0 — compact pills
  { baseW: 160, perPhotoW: 0, maxW: 280 },
  // Level 1 — story cards
  { baseW: 180, perPhotoW: 16, maxW: 340 },
  // Level 2 — expanded cards with photo strips
  { baseW: 280, perPhotoW: 12, maxW: 480 },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const YEAR_START = new Date('2024-01-01').getTime()
const YEAR_END = new Date('2024-12-31T23:59:59').getTime()
const YEAR_MS = YEAR_END - YEAR_START

function dateToX(dateStr, totalWidth, paddingLeft) {
  const ms = new Date(dateStr).getTime() - YEAR_START
  return paddingLeft + (ms / YEAR_MS) * (totalWidth - paddingLeft * 2)
}

function storyMidX(story, totalWidth, paddingLeft) {
  const startMs = new Date(story.dateRange.start).getTime()
  const endMs = new Date(story.dateRange.end).getTime()
  const midMs = startMs + (endMs - startMs) / 2
  return dateToX(new Date(midMs).toISOString(), totalWidth, paddingLeft)
}

// ─── Compute island positions with overlap stacking ──────────────────
function computeIslandLayout(stories, opts) {
  const { totalWidth, paddingLeft, gapFromRiver, zoomLevel } = opts
  const wCfg = ISLAND_WIDTH_CONFIG[zoomLevel] || ISLAND_WIDTH_CONFIG[1]

  const sorted = [...stories]
    .map((s, originalIndex) => ({ story: s, originalIndex }))
    .sort((a, b) => new Date(a.story.dateRange.start) - new Date(b.story.dateRange.start))

  const positions = []
  const rows = { above: [], below: [] }

  sorted.forEach(({ story, originalIndex }, sortedIndex) => {
    const width = Math.min(wCfg.baseW + story.photos.length * wCfg.perPhotoW, wCfg.maxW)
    const height = getIslandHeight(story, zoomLevel)
    const midX = storyMidX(story, totalWidth, paddingLeft)
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

    rows[side].push({ x1: x, x2: x + width, level, height })

    positions.push({ story, originalIndex, x, width, height, side, level })
  })

  return positions
}

// ─── Find gaps between stories for dashed river segments ─────────────
function findGaps(stories, totalWidth, paddingLeft) {
  const periods = stories
    .map((s) => ({
      start: new Date(s.dateRange.start).getTime(),
      end: new Date(s.dateRange.end).getTime(),
    }))
    .sort((a, b) => a.start - b.start)

  const merged = []
  for (const p of periods) {
    if (merged.length && p.start <= merged[merged.length - 1].end + 14 * 24 * 3600 * 1000) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, p.end)
    } else {
      merged.push({ ...p })
    }
  }

  const gaps = []
  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = merged[i].end
    const gapEnd = merged[i + 1].start
    if (gapEnd - gapStart > 20 * 24 * 3600 * 1000) {
      gaps.push({
        startX: dateToX(new Date(gapStart).toISOString(), totalWidth, paddingLeft),
        endX: dateToX(new Date(gapEnd).toISOString(), totalWidth, paddingLeft),
      })
    }
  }

  return gaps
}

/**
 * RiverTimeline — the main view showing all story arcs on a horizontal
 * timeline with zoom support.
 */
export default function RiverTimeline() {
  const scrollRef = useRef(null)
  const canvasRef = useRef(null)
  const [canvasHeight, setCanvasHeight] = useState(600)
  const [hoveredStoryId, setHoveredStoryId] = useState(null)
  const [riverDone, setRiverDone] = useState(false)

  const handleRiverDrawComplete = useCallback(() => setRiverDone(true), [])

  // ── Zoom ──
  const {
    zoomLevel,
    zoomMultiplier,
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut,
    levelLabel,
    totalLevels,
  } = useTimelineZoom(scrollRef)

  // ── Scaled layout constants ──
  const zm = zoomMultiplier
  const TOTAL_WIDTH = BASE_TOTAL_WIDTH * zm
  const MONTH_WIDTH = BASE_MONTH_WIDTH * zm
  const ISLAND_GAP_FROM_RIVER = BASE_GAP_FROM_RIVER * zm
  const PADDING_LEFT = BASE_PADDING_LEFT * zm

  const {
    scrollLeft,
    viewportWidth,
    scrollFraction,
    viewportFraction,
    scrollTo,
    startMinimapDrag,
  } = useTimelineScroll(scrollRef, TOTAL_WIDTH, { verticalScroll: zoomLevel >= 2 })

  const islandLayout = useMemo(
    () =>
      computeIslandLayout(storyArcs, {
        totalWidth: TOTAL_WIDTH,
        paddingLeft: PADDING_LEFT,
        gapFromRiver: ISLAND_GAP_FROM_RIVER,
        zoomLevel,
      }),
    [zoomLevel, zm] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Compute canvas dimensions for higher zoom levels where cards may overflow viewport
  const { requiredCanvasHeight, riverY: fixedRiverY } = useMemo(() => {
    if (zoomLevel <= 1) return { requiredCanvasHeight: 0, riverY: null }
    let maxAbove = 0
    let maxBelow = 0
    const stackGap = 16
    for (const item of islandLayout) {
      const extent = ISLAND_GAP_FROM_RIVER + item.height + item.level * (item.height + stackGap)
      if (item.side === 'above') maxAbove = Math.max(maxAbove, extent)
      else maxBelow = Math.max(maxBelow, extent)
    }
    const riverY = maxAbove + 40 // 40px top padding
    return {
      requiredCanvasHeight: riverY + maxBelow + 40,
      riverY,
    }
  }, [islandLayout, zoomLevel, ISLAND_GAP_FROM_RIVER])

  const gaps = useMemo(
    () => findGaps(storyArcs, TOTAL_WIDTH, PADDING_LEFT),
    [zm] // eslint-disable-line react-hooks/exhaustive-deps
  )

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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Center vertically on the river when entering tall zoom levels
  useEffect(() => {
    const el = scrollRef.current
    if (!el || fixedRiverY == null) return
    requestAnimationFrame(() => {
      el.scrollTop = Math.max(0, fixedRiverY - el.clientHeight / 2)
    })
  }, [fixedRiverY]) // eslint-disable-line react-hooks/exhaustive-deps

  const [headerRef, headerVisible] = useInView()
  const [footerRef, footerVisible] = useInView()

  const handleIslandHover = useCallback((id) => {
    setHoveredStoryId(id)
  }, [])

  // Zoom level label toast — shows briefly when zoom changes
  const [zoomToast, setZoomToast] = useState(null)
  const prevZoomLevel = useRef(zoomLevel)
  useEffect(() => {
    if (prevZoomLevel.current !== zoomLevel) {
      setZoomToast(levelLabel)
      const timer = setTimeout(() => setZoomToast(null), 1200)
      prevZoomLevel.current = zoomLevel
      return () => clearTimeout(timer)
    }
  }, [zoomLevel, levelLabel])

  // Compute visible time context from scroll position
  const visibleContext = useMemo(() => {
    if (TOTAL_WIDTH === 0 || viewportWidth === 0) return null
    const leftFrac = Math.max(0, (scrollLeft - PADDING_LEFT) / (TOTAL_WIDTH - PADDING_LEFT * 2))
    const rightFrac = Math.min(1, (scrollLeft + viewportWidth - PADDING_LEFT) / (TOTAL_WIDTH - PADDING_LEFT * 2))
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const startMonth = Math.max(0, Math.min(11, Math.floor(leftFrac * 12)))
    const endMonth = Math.max(0, Math.min(11, Math.floor(rightFrac * 12)))
    // Find stories visible in the viewport
    const visibleStories = islandLayout.filter(({ x, width }) =>
      x + width > scrollLeft && x < scrollLeft + viewportWidth
    )
    if (startMonth === endMonth) {
      return { time: MONTH_NAMES[startMonth] + ' 2024', storyCount: visibleStories.length }
    }
    return { time: `${MONTH_NAMES[startMonth]} – ${MONTH_NAMES[endMonth]} 2024`, storyCount: visibleStories.length }
  }, [scrollLeft, viewportWidth, TOTAL_WIDTH, PADDING_LEFT, islandLayout])

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
          <span className="text-[13px] lg:text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
            {storyArcs.length} stories
          </span>
          <span className="text-[13px] lg:text-[14px] hidden sm:inline" style={{ color: 'var(--color-text-secondary)' }}>
            {totalPhotos} photos
          </span>
          <span
            className="text-[13px] px-2 py-0.5 rounded-full"
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
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={scrollRef}
          className={`h-full overflow-x-auto relative outline-none ${zoomLevel >= 2 ? 'overflow-y-auto' : 'overflow-y-hidden'}`}
          tabIndex={0}
          role="region"
          aria-label="Timeline — scroll horizontally to explore stories, Ctrl+scroll or pinch to zoom"
        >
          <div
            ref={canvasRef}
            className="relative"
            style={{
              width: TOTAL_WIDTH,
              height: requiredCanvasHeight > 0 ? requiredCanvasHeight : '100%',
              minHeight: '100%',
              transition: 'width 350ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* ── Mood-colored River Line ──────────────────────────── */}
            <MoodRiver
              stories={storyArcs}
              totalWidth={TOTAL_WIDTH}
              paddingLeft={PADDING_LEFT}
              onDrawComplete={handleRiverDrawComplete}
              riverY={fixedRiverY}
            />

            {/* ── Gap dashed lines ─────────────────────────────────── */}
            {gaps.map((gap, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: gap.startX,
                  width: gap.endX - gap.startX,
                  top: fixedRiverY != null ? fixedRiverY : '50%',
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

            {/* ── Month Markers ────────────────────────────────────── */}
            {MONTHS.map((month, i) => {
              const x = PADDING_LEFT + i * MONTH_WIDTH
              return (
                <div key={month} className="absolute" style={{ left: x, top: 0, bottom: 0 }}>
                  <div
                    className="absolute"
                    style={{
                      left: 0,
                      top: fixedRiverY != null ? fixedRiverY - 16 : 'calc(50% - 16px)',
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
                      top: fixedRiverY != null ? fixedRiverY - 2 : 'calc(50% - 2px)',
                      width: '5px',
                      height: '5px',
                      backgroundColor: 'var(--color-accent)',
                      opacity: 0.4,
                    }}
                  />
                  <span
                    className="absolute text-[13px] lg:text-[14px] font-medium select-none month-label-enter"
                    style={{
                      left: '8px',
                      top: fixedRiverY != null ? fixedRiverY + 8 : 'calc(50% + 8px)',
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
              riverY={fixedRiverY}
            />

            {/* ── Connection Threads (SVG overlay) ─────────────────── */}
            <ConnectionThreads
              stories={storyArcs}
              islandLayout={islandLayout}
              hoveredStoryId={hoveredStoryId}
              gapFromRiver={ISLAND_GAP_FROM_RIVER}
              totalWidth={TOTAL_WIDTH}
              canvasHeight={canvasHeight}
              riverY={fixedRiverY}
            />

            {/* ── Story Islands ────────────────────────────────────── */}
            {islandLayout.map(({ story, originalIndex, x, width, height, side, level }) => {
              const stackGap = 16
              const stackOffset = level * (height + stackGap)

              let top
              if (fixedRiverY != null) {
                // Absolute positioning for tall zoom levels
                if (side === 'above') {
                  top = fixedRiverY - ISLAND_GAP_FROM_RIVER - height - stackOffset
                } else {
                  top = fixedRiverY + ISLAND_GAP_FROM_RIVER + stackOffset
                }
              } else {
                // CSS calc for viewport-centered zoom levels
                if (side === 'above') {
                  top = `calc(50% - ${ISLAND_GAP_FROM_RIVER + height + stackOffset}px)`
                } else {
                  top = `calc(50% + ${ISLAND_GAP_FROM_RIVER + stackOffset}px)`
                }
              }

              return (
                <StoryIsland
                  key={story.id}
                  story={story}
                  index={originalIndex}
                  onHover={handleIslandHover}
                  zoomLevel={zoomLevel}
                  zoomMultiplier={zm}
                  style={{
                    left: x,
                    top,
                    width,
                    ...(zoomLevel >= 2 ? { minHeight: height } : { height }),
                  }}
                />
              )
            })}

            {/* ── Year label ───────────────────────────────────────── */}
            <div
              className="absolute text-sm font-medium"
              style={{
                left: PADDING_LEFT - 60 * zm,
                top: fixedRiverY != null ? fixedRiverY - 8 : 'calc(50% - 8px)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              2024
            </div>
          </div>
        </div>

        {/* ── Zoom Controls (floating on right) ───────────────────── */}
        <ZoomControls
          zoomLevel={zoomLevel}
          totalLevels={totalLevels}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
          levelLabel={levelLabel}
        />

        {/* ── Zoom level toast ────────────────────────────────────── */}
        <AnimatePresence>
          {zoomToast && (
            <motion.div
              className="absolute left-1/2 flex items-center gap-2 px-4 py-2 rounded-full pointer-events-none"
              style={{
                top: 16,
                transform: 'translateX(-50%)',
                zIndex: 30,
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <span className="text-[14px] font-medium" style={{ color: 'var(--color-accent)' }}>
                {zoomToast}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Floating context pill (visible at zoom 1+) ──────────── */}
        {zoomLevel >= 1 && visibleContext && (
          <div
            className="absolute left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              bottom: 12,
              zIndex: 20,
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {visibleContext.time}
            </span>
            {visibleContext.storyCount > 0 && (
              <>
                <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>·</span>
                <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {visibleContext.storyCount} {visibleContext.storyCount === 1 ? 'story' : 'stories'} in view
                </span>
              </>
            )}
          </div>
        )}
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
        <span className="text-[13px] lg:text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
          Scroll or ← → to navigate · Ctrl+scroll or pinch to zoom · Click a story to explore
        </span>
        <span className="text-[13px] lg:text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
          Story Arcs — Your year in stories
        </span>
      </div>
    </div>
  )
}
