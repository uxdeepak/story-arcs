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

  // Hover preview thumbnails for compact zoom levels (0, 1) where photos aren't visible inline
  const previewPhotos = zoomLevel <= 1
    ? story.photos.filter((_, i) => i !== story.coverPhotoIndex).slice(0, 4)
    : []

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

      {/* Hover preview thumbnails — restored from earlier design */}
      {previewPhotos.length > 0 && (
        <motion.div
          className="absolute left-1/2 flex gap-1.5 pointer-events-none"
          style={{ top: '100%', marginTop: 8, transform: 'translateX(-50%)' }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : -8,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {previewPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              className="rounded-md overflow-hidden"
              style={{
                width: 44,
                height: 44,
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-tooltip)',
                backgroundColor: 'var(--color-surface-elevated)',
              }}
              animate={{
                rotate: isHovered ? (i - 1.5) * 4 : 0,
                y: isHovered ? Math.abs(i - 1.5) * 3 : 0,
              }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </motion.div>
          ))}
        </motion.div>
      )}
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
            className="text-[13px] font-semibold truncate flex-1"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
          >
            {story.title}
          </h3>
          <span className="text-[14px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
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
    const photoH = Math.round(style.height * 0.62)
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
              className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[13px] font-medium"
              style={{ backgroundColor: 'var(--color-overlay-badge)', color: 'var(--color-text-secondary)', backdropFilter: 'blur(6px)' }}
            >
              {story.photos.length}
            </div>
          </div>

          {/* Info region */}
          <div className="p-2.5 flex flex-col justify-between" style={{ height: infoH }}>
            <h3
              className="text-[17px] font-semibold leading-tight truncate"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
            >
              {story.title}
            </h3>
            <p className="text-[12px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {formatDateRange(story.dateRange.start, story.dateRange.end)}
              <span style={{ margin: '0 3px', color: 'var(--color-text-muted)' }}>·</span>
              {story.primaryLocation}
            </p>
            {story.people.length > 0 && (
              <div className="flex gap-1 mt-0.5">
                {story.people.map((p) => (
                  <div key={p} className="flex items-center gap-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PERSON_COLORS[p] || 'var(--color-text-muted)' }} />
                    <span className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>{p}</span>
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
            borderLeft: `3px solid ${moodColor}`,
          }}
          animate={{
            scale: isHovered ? 1.02 : 1,
            boxShadow: isHovered ? shadowHover : shadowIdle,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Compact header — no big cover image */}
          <div className="px-4 pt-3 pb-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <h3
                className="text-[16px] font-semibold leading-tight truncate"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
              >
                {story.title}
              </h3>
              <span className="text-[14px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                {story.photos.length} photos
              </span>
            </div>
            <p className="text-[14px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {formatDateRange(story.dateRange.start, story.dateRange.end)}
              <span style={{ margin: '0 6px', color: 'var(--color-text-muted)' }}>·</span>
              {story.primaryLocation}
            </p>
            {story.people.length > 0 && (
              <div className="flex gap-2 mt-2">
                {story.people.map((p) => (
                  <div key={p} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PERSON_COLORS[p] || 'var(--color-text-muted)' }} />
                    <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cluster rows — heading + horizontal photo row, larger thumbs */}
          <div
            className="px-4 pt-2 pb-3 flex flex-col gap-3"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            {clusters.map((cluster) => (
              <div key={cluster.name}>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {cluster.name}
                  </span>
                  {annotations[cluster.name] && (
                    <span className="text-[13px] italic truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {annotations[cluster.name]}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {cluster.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-md overflow-hidden shrink-0"
                      style={{
                        width: 56,
                        height: 56,
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

  return null
}

/**
 * Compute the island height for a story at a given zoom level.
 * Used by RiverTimeline's layout computation.
 */
export function getIslandHeight(story, zoomLevel) {
  if (zoomLevel === 0) return 36
  if (zoomLevel === 1) return 220
  // Level 2: Header (~96) + each cluster (~22 label + 56 thumb + 12 gap) + padding
  const clusters = [...new Set(story.photos.map((p) => p.cluster))].length
  return 100 + clusters * 90 + 16
}
