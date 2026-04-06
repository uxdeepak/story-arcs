import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'

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

/**
 * StoryIsland — adapts rendering based on zoomLevel:
 *  0 (Overview)  — compact colored pill with title only, no photo
 *  1 (Default)   — cover photo, title, date, people, hover thumbnails
 *  2 (Detailed)  — same as 1 but scaled larger
 *  3 (Photos)    — cover photo + visible photo grid, no hover needed
 */
export default function StoryIsland({ story, style, index, onHover, zoomLevel = 1, zoomMultiplier = 1 }) {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const coverPhoto = story.photos[story.coverPhotoIndex] || story.photos[0]
  const previewPhotos = story.photos
    .filter((_, i) => i !== story.coverPhotoIndex)
    .slice(0, 4)

  // At zoom level 3, show a grid of photos inside the card
  const gridPhotos = story.photos.slice(0, 6)

  // Theme-aware shadows
  const shadowIdle = isLight
    ? '0 8px 30px rgba(0,0,0,0.1), 0 0 15px rgba(184,94,58,0.08)'
    : '0 8px 30px rgba(0,0,0,0.3), 0 0 15px rgba(196,114,78,0.05)'
  const shadowHover = isLight
    ? '0 20px 60px rgba(0,0,0,0.18), 0 0 30px rgba(184,94,58,0.15), inset 0 0 0 1px rgba(184,94,58,0.3)'
    : '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(196,114,78,0.3), inset 0 0 0 1px rgba(196,114,78,0.4)'

  // ── Level 0: Compact overview pill ──
  if (zoomLevel === 0) {
    return (
      <motion.div
        className="absolute cursor-pointer"
        style={{
          ...style,
          zIndex: isHovered ? 20 : 10,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 1.2 + index * 0.06,
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
        <motion.div
          className="relative overflow-hidden rounded-lg flex items-center gap-2 px-3"
          style={{
            width: style.width,
            height: style.height,
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
          }}
          animate={{
            scale: isHovered ? 1.05 : 1,
            boxShadow: isHovered ? shadowHover : shadowIdle,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Mood color dot */}
          <div
            className="rounded-full shrink-0"
            style={{
              width: 8 * zoomMultiplier,
              height: 8 * zoomMultiplier,
              backgroundColor: PERSON_COLORS[story.people[0]] || 'var(--color-accent)',
            }}
          />
          {/* Title */}
          <h3
            className="font-semibold truncate leading-tight"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-text-primary)',
              fontSize: Math.max(10, 11 * zoomMultiplier),
            }}
          >
            {story.title}
          </h3>
          {/* Photo count */}
          <span
            className="text-[10px] shrink-0 ml-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {story.photos.length}
          </span>
        </motion.div>
      </motion.div>
    )
  }

  // ── Levels 1–3: Full card with cover photo ──
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        ...style,
        zIndex: isHovered ? 20 : 10,
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 1.2 + index * 0.1,
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
      {/* Ambient glow */}
      <div
        className="absolute -inset-3 rounded-2xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, var(--color-accent-subtle) 0%, transparent 70%)',
          opacity: isHovered ? 1 : 0.4,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* Main card */}
      <motion.div
        className="relative overflow-hidden rounded-xl"
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
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Cover photo */}
        <div className="absolute inset-0">
          <img
            src={coverPhoto.url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, var(--color-overlay-strong) 0%, var(--color-overlay-medium) 50%, var(--color-overlay-light) 100%)`,
            }}
          />
        </div>

        {/* Content overlay */}
        <div className="relative h-full flex flex-col justify-end p-4">
          {/* Photo count badge */}
          <div
            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--color-overlay-badge)',
              color: 'var(--color-text-secondary)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {story.photos.length} photos
          </div>

          {/* Photo grid at zoom level 3 */}
          {zoomLevel >= 3 && (
            <div
              className="absolute top-3 left-3 right-14 grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${Math.min(gridPhotos.length, 3)}, 1fr)`,
              }}
            >
              {gridPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-md overflow-hidden"
                  style={{
                    aspectRatio: '1',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Title */}
          <h3
            className="leading-tight mb-1 font-semibold"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-text-primary)',
              fontSize: zoomLevel >= 3 ? '1.25rem' : '1.125rem',
            }}
          >
            {story.title}
          </h3>

          {/* Date range & location */}
          <p
            className="text-xs mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {formatDateRange(story.dateRange.start, story.dateRange.end)}
            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>·</span>
            {story.primaryLocation}
          </p>

          {/* People dots */}
          {story.people.length > 0 && (
            <div className="flex gap-1.5">
              {story.people.map((person) => (
                <div
                  key={person}
                  className="flex items-center gap-1"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: PERSON_COLORS[person] || 'var(--color-text-muted)',
                    }}
                  />
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {person}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Hover preview thumbnails (levels 1-2 only, level 3 shows grid inside card) */}
      {zoomLevel < 3 && (
        <motion.div
          className="absolute left-1/2 flex gap-1.5 pointer-events-none"
          style={{
            top: `calc(${style.height}px + 8px)`,
            transform: 'translateX(-50%)',
          }}
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
              }}
              animate={{
                rotate: isHovered ? (i - 1.5) * 4 : 0,
                y: isHovered ? Math.abs(i - 1.5) * 3 : 0,
              }}
              transition={{
                duration: 0.4,
                delay: i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
