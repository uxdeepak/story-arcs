import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MapPin, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext.jsx'

const PERSON_COLORS = {
  Maya: '#C4724E',
  Jon: '#6B8A7A',
  Alex: '#D4A03E',
}

function formatTime(timestamp) {
  const d = new Date(timestamp)
  return (
    d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  )
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: 'var(--color-border)', margin: '16px 0' }} />
}

/**
 * Lightbox — full-screen photo viewer with crossfade transitions,
 * metadata panel, keyboard/click navigation, and favorite/remove actions.
 */
export default function Lightbox({
  photo,
  story,
  photos,
  onClose,
  onNavigate,
  onRemove,
  favorites,
  onToggleFavorite,
}) {
  const [hoverSide, setHoverSide] = useState(null)
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const currentIndex = photos.findIndex((p) => p.id === photo?.id)
  const isFavorite = photo && favorites?.has(photo.id)

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(photos[currentIndex - 1])
  }, [currentIndex, photos, onNavigate])

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(photos[currentIndex + 1])
  }, [currentIndex, photos, onNavigate])

  useEffect(() => {
    if (!photo) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'f' || e.key === 'F') onToggleFavorite?.(photo.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photo, onClose, goPrev, goNext, onToggleFavorite])

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop with vignette — always dark, slightly less opaque in light mode */}
          <div
            className="absolute inset-0"
            style={{
              background: isLight
                ? 'radial-gradient(ellipse at center, rgba(10,10,9,0.78) 0%, rgba(10,10,9,0.88) 55%, rgba(10,10,9,0.94) 100%)'
                : 'radial-gradient(ellipse at center, rgba(10,10,9,0.88) 0%, rgba(10,10,9,0.96) 55%, rgba(10,10,9,0.99) 100%)',
            }}
          />

          {/* Vignette edge overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)',
            }}
          />

          {/* ── Photo area ─────────────────────────────────────── */}
          <div className="relative flex-1 flex flex-col" style={{ zIndex: 1 }}>
            {/* Photo display */}
            <div className="flex-1 relative min-h-0">
              {/* Crossfade photo display */}
              <div className="absolute inset-8 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 28,
                    delay: 0.05,
                  }}
                  className="relative"
                  style={{ maxHeight: '100%', maxWidth: '100%' }}
                >
                  <AnimatePresence initial={false} mode="wait">
                    <motion.img
                      key={photo.id}
                      src={photo.url}
                      alt={`${photo.location} — ${photo.people.length ? photo.people.join(', ') : 'photo'}`}
                      className="block rounded-lg"
                      style={{
                        maxHeight: 'calc(100vh - 200px)',
                        maxWidth: 'calc(100vw - 420px)',
                        objectFit: 'contain',
                        boxShadow: 'var(--shadow-image)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      draggable={false}
                    />
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Click-to-navigate halves */}
              <div className="absolute inset-0 flex" style={{ zIndex: 2 }}>
                {/* Left half */}
                <div
                  className="w-1/2 h-full flex items-center pl-6"
                  style={{ cursor: currentIndex > 0 ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (currentIndex > 0) goPrev()
                  }}
                  onMouseEnter={() => currentIndex > 0 && setHoverSide('left')}
                  onMouseLeave={() => setHoverSide(null)}
                >
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'var(--color-text-secondary)',
                      backdropFilter: 'blur(8px)',
                    }}
                    animate={{ opacity: hoverSide === 'left' ? 0.9 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronLeft size={20} />
                  </motion.div>
                </div>
                {/* Right half */}
                <div
                  className="w-1/2 h-full flex items-center justify-end pr-6"
                  style={{
                    cursor: currentIndex < photos.length - 1 ? 'pointer' : 'default',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (currentIndex < photos.length - 1) goNext()
                  }}
                  onMouseEnter={() =>
                    currentIndex < photos.length - 1 && setHoverSide('right')
                  }
                  onMouseLeave={() => setHoverSide(null)}
                >
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'var(--color-text-secondary)',
                      backdropFilter: 'blur(8px)',
                    }}
                    animate={{ opacity: hoverSide === 'right' ? 0.9 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronRight size={20} />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* ── Bottom toolbar ──────────────────────────────── */}
            <motion.div
              className="flex items-center justify-between px-6 py-3 shrink-0"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                zIndex: 3,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              {/* Nav controls */}
              <div className="flex items-center gap-1">
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-default"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={16} />
                </button>
                <span
                  className="text-xs px-2 min-w-[60px] text-center"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {currentIndex + 1} of {photos.length}
                </span>
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-default"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onClick={goNext}
                  disabled={currentIndex === photos.length - 1}
                  aria-label="Next photo"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    color: isFavorite ? 'var(--color-favorite)' : 'var(--color-text-muted)',
                    transition: 'color 0.15s',
                  }}
                  onClick={() => onToggleFavorite?.(photo.id)}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  title="Toggle favorite (F)"
                >
                  <Heart
                    size={16}
                    fill={isFavorite ? 'var(--color-favorite)' : 'none'}
                    strokeWidth={isFavorite ? 0 : 2}
                  />
                </button>
                {onRemove && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs"
                    style={{
                      color: 'var(--color-text-muted)',
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.15s, color 0.15s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color = 'var(--color-text-secondary)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--color-text-muted)'
                    }}
                    onClick={() => onRemove(photo)}
                    title="Remove from story"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Metadata panel ─────────────────────────────────── */}
          <motion.div
            className="relative w-[320px] shrink-0 flex flex-col overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border)',
              zIndex: 1,
            }}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex items-center justify-end p-4 shrink-0">
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                }}
                onClick={onClose}
                aria-label="Close lightbox"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Date & time */}
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Date & Time
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {formatTime(photo.timestamp)}
                </p>
              </div>

              <Divider />

              {/* Location */}
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Location
                </p>
                <div className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {photo.location}
                  </p>
                </div>
              </div>

              {/* People */}
              {photo.people.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-widest mb-2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      People
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {photo.people.map((person) => (
                        <div
                          key={person}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--color-surface-elevated)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                            style={{
                              backgroundColor:
                                PERSON_COLORS[person] || 'var(--color-text-muted)',
                              color: 'var(--color-bg)',
                            }}
                          >
                            {person[0]}
                          </div>
                          <span
                            className="text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {person}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Divider />

              {/* Cluster */}
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Cluster
                </p>
                <span
                  className="text-xs px-2.5 py-1 rounded-full inline-block"
                  style={{
                    backgroundColor: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {photo.cluster}
                </span>
              </div>

              <Divider />

              {/* Story */}
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Story
                </p>
                <p
                  className="text-sm cursor-pointer"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--color-text-primary)',
                    transition: 'color 0.15s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'var(--color-accent)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                  }}
                  onClick={onClose}
                >
                  {story.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {story.primaryLocation}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
