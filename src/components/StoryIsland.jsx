import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { clusterAnnotations } from '../data/demoData.js'

const MOOD_COLORS = {
  warm: '#C4724E',
  calm: '#6B8A7A',
  euphoric: '#D4A03E',
}

const PERSON_COLORS = {
  Maya: '#C4724E',
  Jon: '#6B8A7A',
  Alex: '#D4A03E',
}

function formatDateRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const opts = { month: 'short', day: 'numeric' }
  if (s.getTime() === e.getTime()) {
    return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.toLocaleDateString('en-US', opts)} – ${e.getDate()}, ${e.getFullYear()}`
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

function formatPhotoTime(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** Group photos by cluster field */
function groupByCluster(photos) {
  const groups = []
  const seen = new Set()
  for (const photo of photos) {
    if (!seen.has(photo.cluster)) {
      seen.add(photo.cluster)
      groups.push({ name: photo.cluster, photos: [] })
    }
    groups.find((g) => g.name === photo.cluster).photos.push(photo)
  }
  return groups
}

// Shared wrapper for all levels — handles positioning, click, hover, keyboard
// Animates position/size changes via CSS transitions, crossfades content via AnimatePresence
function IslandWrapper({ story, style, index, onHover, zoomLevel, isHovered, setIsHovered, children }) {
  const navigate = useNavigate()

  // Separate positioning props (animated via CSS) from size props
  const { left, top, width, height, minHeight, ...restStyle } = style

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left,
        top,
        width,
        height,
        minHeight,
        zIndex: isHovered ? 20 : 10,
        transition: 'left 400ms cubic-bezier(0.22,1,0.36,1), top 400ms cubic-bezier(0.22,1,0.36,1), width 400ms cubic-bezier(0.22,1,0.36,1)',
        ...restStyle,
      }}
      initial={{ opacity: 0, y: zoomLevel === 0 ? 16 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 1.2 + index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      role="button"
      tabIndex={0}
      aria-label={`${story.title} — ${story.photos.length} photos`}
      onMouseEnter={() => { setIsHovered(true); onHover?.(story.id) }}
      onMouseLeave={() => { setIsHovered(false); onHover?.(null) }}
      onClick={() => navigate(`/story/${story.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/story/${story.id}`)
        }
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={zoomLevel}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * StoryIsland — 4 distinct rendering modes with progressive information disclosure:
 *
 *  Level 0 (Year)    — Compact pill: mood dot + title + photo count
 *                       New info: temporal position, story names
 *  Level 1 (Stories) — Split card: cover photo top, info bottom
 *                       New info: cover photo, date, location, people
 *  Level 2 (Photos)  — Card + clustered photo strip below
 *                       New info: all photo thumbnails, cluster groupings, cluster annotations
 *  Level 3 (Detail)  — Compact header + photo grid with per-photo metadata
 *                       New info: individual timestamps, locations, people per photo
 */
export default function StoryIsland({ story, style, index, onHover, zoomLevel = 1 }) {
  const [isHovered, setIsHovered] = useState(false)
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const coverPhoto = story.photos[story.coverPhotoIndex] || story.photos[0]
  const moodColor = MOOD_COLORS[story.mood] || MOOD_COLORS.warm

  const shadowIdle = isLight
    ? '0 4px 20px rgba(0,0,0,0.08)'
    : '0 4px 20px rgba(0,0,0,0.25)'
  const shadowHover = isLight
    ? '0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(184,94,58,0.2)'
    : '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(196,114,78,0.3)'

  const wrapperProps = { story, style, index, onHover, zoomLevel, isHovered, setIsHovered }

  // ────────────────────────────────────────────────────────────────────
  // Level 0 — Compact pill
  // New info vs nothing: story names, temporal position, photo counts
  // ────────────────────────────────────────────────────────────────────
  if (zoomLevel === 0) {
    return (
      <IslandWrapper {...wrapperProps}>
        <motion.div
          className="flex items-center gap-2 px-3 rounded-lg overflow-hidden"
          style={{
            width: style.width,
            height: style.height,
            backgroundColor: 'var(--color-surface-elevated)',
            borderTop: '1px solid var(--color-border)',
            borderRight: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            borderLeft: `3px solid ${moodColor}`,
          }}
          animate={{
            scale: isHovered ? 1.04 : 1,
            boxShadow: isHovered ? shadowHover : shadowIdle,
          }}
          transition={{ duration: 0.25 }}
        >
          <h3
            className="text-[11px] font-semibold truncate flex-1"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
          >
            {story.title}
          </h3>
          <span className="text-[9px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {story.photos.length}
          </span>
        </motion.div>
      </IslandWrapper>
    )
  }

  // ────────────────────────────────────────────────────────────────────
  // Level 1 — Story card (split layout: photo top, info bottom)
  // New info vs Level 0: cover photo, date range, location, people
  // ────────────────────────────────────────────────────────────────────
  if (zoomLevel === 1) {
    const photoH = Math.round(style.height * 0.55)
    const infoH = style.height - photoH

    return (
      <IslandWrapper {...wrapperProps}>
        <motion.div
          className="rounded-xl overflow-hidden"
          style={{
            width: style.width,
            height: style.height,
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
          }}
          animate={{
            scale: isHovered ? 1.03 : 1,
            boxShadow: isHovered ? shadowHover : shadowIdle,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Cover photo region */}
          <div className="relative overflow-hidden" style={{ height: photoH }}>
            <img src={coverPhoto.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div
              className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: 'var(--color-overlay-badge)', color: 'var(--color-text-secondary)', backdropFilter: 'blur(6px)' }}
            >
              {story.photos.length}
            </div>
          </div>

          {/* Info region */}
          <div className="p-2.5 flex flex-col justify-between" style={{ height: infoH }}>
            <h3
              className="text-[13px] font-semibold leading-tight truncate"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
            >
              {story.title}
            </h3>
            <p className="text-[10px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {formatDateRange(story.dateRange.start, story.dateRange.end)}
              <span style={{ margin: '0 3px', color: 'var(--color-text-muted)' }}>·</span>
              {story.primaryLocation}
            </p>
            {story.people.length > 0 && (
              <div className="flex gap-1 mt-0.5">
                {story.people.map((p) => (
                  <div key={p} className="flex items-center gap-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PERSON_COLORS[p] || 'var(--color-text-muted)' }} />
                    <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </IslandWrapper>
    )
  }

  // ────────────────────────────────────────────────────────────────────
  // Level 2 — Card + clustered photo strip below
  // New info vs Level 1: all photo thumbnails, cluster groupings, annotations
  // ────────────────────────────────────────────────────────────────────
  if (zoomLevel === 2) {
    const cardH = 160
    const clusters = groupByCluster(story.photos)
    const annotations = clusterAnnotations[story.id] || {}

    return (
      <IslandWrapper {...wrapperProps}>
        <motion.div
          className="rounded-xl overflow-hidden"
          style={{
            width: style.width,
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
          }}
          animate={{
            scale: isHovered ? 1.02 : 1,
            boxShadow: isHovered ? shadowHover : shadowIdle,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Cover photo + info (compact) */}
          <div className="flex" style={{ height: cardH }}>
            <div className="relative shrink-0" style={{ width: Math.round(style.width * 0.4) }}>
              <img src={coverPhoto.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
              <div>
                <h3
                  className="text-sm font-semibold leading-tight"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
                >
                  {story.title}
                </h3>
                <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDateRange(story.dateRange.start, story.dateRange.end)}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {story.primaryLocation}
                </p>
              </div>
              {story.people.length > 0 && (
                <div className="flex gap-1.5 mt-1">
                  {story.people.map((p) => (
                    <div key={p} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PERSON_COLORS[p] || 'var(--color-text-muted)' }} />
                      <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{p}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {story.photos.length} photos · {clusters.length} clusters
              </span>
            </div>
          </div>

          {/* Clustered photo strip */}
          <div
            className="px-3 pb-3 pt-2 flex flex-col gap-2"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            {clusters.map((cluster) => (
              <div key={cluster.name}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {cluster.name}
                  </span>
                  {annotations[cluster.name] && (
                    <span className="text-[9px] italic" style={{ color: 'var(--color-text-muted)' }}>
                      {annotations[cluster.name]}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {cluster.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded overflow-hidden shrink-0"
                      style={{
                        width: 38,
                        height: 38,
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </IslandWrapper>
    )
  }

  // ────────────────────────────────────────────────────────────────────
  // Level 3 — Compact header + photo grid with per-photo metadata
  // New info vs Level 2: individual timestamps, locations, people per photo
  // ────────────────────────────────────────────────────────────────────
  const clusters = groupByCluster(story.photos)

  return (
    <IslandWrapper {...wrapperProps}>
      <motion.div
        className="rounded-xl overflow-hidden"
        style={{
          width: style.width,
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
        }}
        animate={{
          boxShadow: isHovered ? shadowHover : shadowIdle,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Compact header bar */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: moodColor }} />
          <h3
            className="text-sm font-semibold truncate flex-1"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
          >
            {story.title}
          </h3>
          <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {formatDateRange(story.dateRange.start, story.dateRange.end)}
          </span>
          <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {story.primaryLocation}
          </span>
        </div>

        {/* Photo grid grouped by cluster, with per-photo metadata */}
        <div className="p-3 flex flex-col gap-3">
          {clusters.map((cluster) => (
            <div key={cluster.name}>
              <p className="text-[10px] font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                {cluster.name}
              </p>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {cluster.photos.map((photo) => (
                  <div key={photo.id} className="flex flex-col gap-0.5">
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{
                        aspectRatio: '4/3',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <span className="text-[8px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                      {formatPhotoTime(photo.timestamp)}
                    </span>
                    {photo.location !== story.primaryLocation && (
                      <span className="text-[8px] leading-tight truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {photo.location}
                      </span>
                    )}
                    {photo.people.length > 0 && (
                      <div className="flex gap-0.5">
                        {photo.people.map((p) => (
                          <div
                            key={p}
                            className="w-2 h-2 rounded-full"
                            title={p}
                            style={{ backgroundColor: PERSON_COLORS[p] || 'var(--color-text-muted)' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </IslandWrapper>
  )
}

/**
 * Compute the island height for a story at a given zoom level.
 * Used by RiverTimeline's layout computation.
 */
export function getIslandHeight(story, zoomLevel) {
  if (zoomLevel === 0) return 36
  if (zoomLevel === 1) return 190
  if (zoomLevel === 2) {
    // Card (160) + cluster strips (each: 20px label + 38px thumb + 8px gap)
    const clusters = [...new Set(story.photos.map((p) => p.cluster))].length
    return 160 + clusters * 66 + 16
  }
  // Level 3: header (40) + photo grid with per-photo metadata
  // Each photo cell: ~140px (4:3 at ~170px wide) + ~40px metadata text
  const grouped = {}
  for (const p of story.photos) {
    grouped[p.cluster] = (grouped[p.cluster] || 0) + 1
  }
  let gridH = 0
  for (const count of Object.values(grouped)) {
    gridH += Math.ceil(count / 3) * 180 + 32 // 180px per row + cluster label
  }
  return 40 + gridH + 24
}
