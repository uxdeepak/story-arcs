import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { loosePhotos, storyArcs } from '../data/demoData.js'

const MOOD_COLORS = {
  warm: '#C4724E',
  calm: '#6B8A7A',
  euphoric: '#D4A03E',
}

function formatMonth(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatDateTime(date) {
  const d = new Date(date)
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  )
}

/** Group loose photos by year-month */
function groupByMonth(photos) {
  const map = {}
  for (const p of photos) {
    const d = new Date(p.timestamp)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map[key]) map[key] = { key, label: formatMonth(p.timestamp), photos: [], sortDate: d }
    map[key].photos.push(p)
  }
  return Object.values(map).sort((a, b) => a.sortDate - b.sortDate)
}

/** Find stories that overlap a given photo's date (within 14 days) */
function suggestStories(photo) {
  const t = new Date(photo.timestamp).getTime()
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000
  return storyArcs
    .map((s) => {
      const start = new Date(s.dateRange.start).getTime()
      const end = new Date(s.dateRange.end).getTime()
      let dist = 0
      if (t < start) dist = start - t
      else if (t > end) dist = t - end
      return { story: s, dist }
    })
    .filter((x) => x.dist < FOURTEEN_DAYS)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map((x) => x.story)
}

function PhotoCell({ photo, onSelect, selected }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      onClick={() => onSelect(photo)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-lg overflow-hidden cursor-pointer text-left"
      style={{
        aspectRatio: '1',
        border: selected
          ? '2px solid var(--color-accent)'
          : '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
    >
      <img
        src={photo.url}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute inset-x-0 bottom-0 px-2 py-1.5 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              color: '#fff',
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-[13px] font-medium truncate">{photo.location || 'Unknown'}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function InspectorPanel({ photo, onClose, onOpenStory }) {
  const suggestions = useMemo(() => (photo ? suggestStories(photo) : []), [photo])

  return (
    <AnimatePresence>
      {photo && (
        <motion.aside
          className="fixed top-0 right-0 h-screen w-full sm:w-[420px] z-50 flex flex-col"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderLeft: '1px solid var(--color-border)',
            boxShadow: '-12px 0 40px rgba(0,0,0,0.25)',
          }}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h3
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
            >
              Loose photo
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <img src={photo.url} alt="" className="w-full object-cover" style={{ maxHeight: 360 }} />
            <div className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Captured
                </p>
                <p className="text-base" style={{ color: 'var(--color-text-primary)' }}>
                  {formatDateTime(photo.timestamp)}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Where
                </p>
                <p className="text-base" style={{ color: 'var(--color-text-primary)' }}>
                  {photo.location || 'Unknown'}
                </p>
              </div>

              {/* Story suggestions */}
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Maybe belongs to
                </p>
                {suggestions.length === 0 ? (
                  <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                    No stories within 2 weeks of this date
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {suggestions.map((story) => {
                      const cover = story.photos[story.coverPhotoIndex] || story.photos[0]
                      const moodColor = MOOD_COLORS[story.mood] || MOOD_COLORS.warm
                      return (
                        <button
                          key={story.id}
                          onClick={() => onOpenStory(story.id)}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer text-left"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderLeft: `3px solid ${moodColor}`,
                          }}
                        >
                          <img
                            src={cover.url}
                            alt=""
                            className="w-12 h-12 rounded object-cover shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[14px] font-semibold truncate"
                              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
                            >
                              {story.title}
                            </p>
                            <p className="text-[13px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                              {formatMonth(story.dateRange.start)} · {story.primaryLocation}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Action stubs */}
              <div className="flex flex-col gap-2 mt-2">
                <button
                  className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: '#fff',
                  }}
                >
                  Add to a story…
                </button>
                <button
                  className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Start a new story
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export default function UnsortedPlaceholder() {
  const navigate = useNavigate()
  const groups = useMemo(() => groupByMonth(loosePhotos), [])
  const [selected, setSelected] = useState(null)

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <motion.header
          className="mb-10"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-5xl lg:text-6xl font-semibold tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
          >
            Unsorted
          </h1>
          <p className="text-base mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {loosePhotos.length}
            </strong>{' '}
            loose photos waiting to find a story. Click any to inspect and assign.
          </p>
        </motion.header>

        <div className="flex flex-col gap-10">
          {groups.map((group, gi) => (
            <motion.section
              key={group.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + gi * 0.08 }}
            >
              <div className="flex items-baseline gap-3 mb-3 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
                >
                  {group.label}
                </h2>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {group.photos.length} {group.photos.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {group.photos.map((photo) => (
                  <PhotoCell
                    key={photo.id}
                    photo={photo}
                    selected={selected?.id === photo.id}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>

      <InspectorPanel
        photo={selected}
        onClose={() => setSelected(null)}
        onOpenStory={(id) => navigate(`/story/${id}`)}
      />
    </div>
  )
}
