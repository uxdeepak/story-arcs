import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { storyArcs, allPeople } from '../data/demoData.js'

const PERSON_COLORS = {
  Maya: '#C4724E',
  Jon: '#6B8A7A',
  Alex: '#D4A03E',
}

function formatDateRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const opts = { month: 'short', year: 'numeric' }
  if (s.getTime() === e.getTime()) return s.toLocaleDateString('en-US', opts)
  return `${s.toLocaleDateString('en-US', { month: 'short' })} – ${e.toLocaleDateString('en-US', opts)}`
}

// Collect all unique locations
const allLocations = [...new Set(storyArcs.map((s) => s.primaryLocation))]

// 3 most recent stories by end date
const recentStories = [...storyArcs]
  .sort((a, b) => new Date(b.dateRange.end) - new Date(a.dateRange.end))
  .slice(0, 3)

function searchData(query) {
  const q = query.toLowerCase().trim()
  if (!q) return null

  const stories = storyArcs.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.primaryLocation.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)) ||
      s.people.some((p) => p.toLowerCase().includes(q))
  )

  const people = allPeople
    .filter((p) => p.toLowerCase().includes(q))
    .map((name) => ({
      name,
      storyCount: storyArcs.filter((s) => s.people.includes(name)).length,
    }))

  const places = allLocations
    .filter((loc) => loc.toLowerCase().includes(q))
    .map((location) => ({
      location,
      storyCount: storyArcs.filter((s) => s.primaryLocation === location).length,
    }))

  return { stories, people, places }
}

export default function SearchOverlay({ isOpen, onClose }) {
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchData(query), [query])
  const hasResults =
    results && (results.stories.length || results.people.length || results.places.length)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  function goToStory(id) {
    navigate(`/story/${id}`)
    onClose()
  }

  function goToTimeline() {
    navigate('/')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'var(--color-backdrop-search)' }}
            onClick={onClose}
          />

          {/* Search container */}
          <motion.div
            className="relative w-full max-w-[640px] mx-4 rounded-xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-modal)',
              maxHeight: '70vh',
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Input */}
            <div
              className="flex items-center gap-3 px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <Search size={20} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your memories..."
                className="flex-1 bg-transparent outline-none text-lg"
                style={{
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-serif)',
                }}
              />
              {query && (
                <button
                  className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    color: 'var(--color-text-muted)',
                  }}
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Results area */}
            <div className="overflow-y-auto flex-1 py-2">
              {/* Empty state — no query */}
              {!results && (
                <div className="px-5 py-3">
                  <p
                    className="text-[10px] uppercase tracking-widest font-medium mb-3"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Recent stories
                  </p>
                  {recentStories.map((story, i) => (
                    <StoryRow key={story.id} story={story} index={i} onClick={() => goToStory(story.id)} />
                  ))}
                </div>
              )}

              {/* No results */}
              {results && !hasResults && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    No memories match "{query}"
                  </p>
                </div>
              )}

              {/* Stories results */}
              {results?.stories.length > 0 && (
                <div className="px-5 py-2">
                  <p
                    className="text-[10px] uppercase tracking-widest font-medium mb-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Stories
                  </p>
                  {results.stories.map((story, i) => (
                    <StoryRow key={story.id} story={story} index={i} onClick={() => goToStory(story.id)} />
                  ))}
                </div>
              )}

              {/* People results */}
              {results?.people.length > 0 && (
                <div className="px-5 py-2">
                  <p
                    className="text-[10px] uppercase tracking-widest font-medium mb-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    People
                  </p>
                  {results.people.map((person, i) => (
                    <motion.button
                      key={person.name}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg cursor-pointer"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)' }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      onClick={goToTimeline}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{
                          backgroundColor: PERSON_COLORS[person.name] || 'var(--color-text-muted)',
                          color: 'var(--color-bg)',
                        }}
                      >
                        {person.name[0]}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {person.name}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                          {person.storyCount} {person.storyCount === 1 ? 'story' : 'stories'}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Places results */}
              {results?.places.length > 0 && (
                <div className="px-5 py-2">
                  <p
                    className="text-[10px] uppercase tracking-widest font-medium mb-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Places
                  </p>
                  {results.places.map((place, i) => (
                    <motion.button
                      key={place.location}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg cursor-pointer"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)' }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      onClick={goToTimeline}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0"
                        style={{
                          backgroundColor: 'var(--color-surface-elevated)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        📍
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {place.location}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                          {place.storyCount} {place.storyCount === 1 ? 'story' : 'stories'}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div
              className="px-5 py-2.5 shrink-0 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                esc to close
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {storyArcs.length} stories · {allPeople.length} people · {allLocations.length} places
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Story result row ────────────────────────────────────────────────
function StoryRow({ story, index, onClick }) {
  const coverPhoto = story.photos[story.coverPhotoIndex] || story.photos[0]

  return (
    <motion.button
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg cursor-pointer"
      style={{ backgroundColor: 'transparent' }}
      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)' }}
      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
      onClick={onClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      {/* Thumbnail */}
      <div
        className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
        style={{
          border: '1px solid var(--color-border)',
        }}
      >
        <img
          src={coverPhoto.url}
          alt={`${story.title} cover`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex-1 text-left min-w-0">
        <p
          className="text-sm truncate"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
        >
          {story.title}
        </p>
        <p className="text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {formatDateRange(story.dateRange.start, story.dateRange.end)}
          <span style={{ margin: '0 4px' }}>·</span>
          {story.primaryLocation}
        </p>
      </div>

      {/* Photo count */}
      <span
        className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
        style={{
          backgroundColor: 'var(--color-accent-subtle)',
          color: 'var(--color-accent)',
        }}
      >
        {story.photos.length}
      </span>
    </motion.button>
  )
}
