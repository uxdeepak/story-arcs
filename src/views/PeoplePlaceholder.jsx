import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { allPeople, storyArcs, getStoriesForPerson } from '../data/demoData.js'

const PERSON_COLORS = {
  Maya: '#C4724E',
  Jon: '#6B8A7A',
  Alex: '#D4A03E',
}

const MOOD_COLORS = {
  warm: '#C4724E',
  calm: '#6B8A7A',
  euphoric: '#D4A03E',
}

function formatMonth(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/**
 * Build a per-person digest:
 *  - stories they appear in
 *  - total photos featuring them
 *  - timespan (first → last appearance)
 *  - co-stars with appearance counts
 *  - cover thumbnails from their stories
 */
function buildPersonDigest(name) {
  const stories = getStoriesForPerson(name)

  let photoCount = 0
  let earliest = Infinity
  let latest = -Infinity
  const coStars = {}

  for (const story of stories) {
    for (const photo of story.photos) {
      if (photo.people.includes(name)) {
        photoCount += 1
        const t = new Date(photo.timestamp).getTime()
        if (t < earliest) earliest = t
        if (t > latest) latest = t
      }
    }
    for (const other of story.people) {
      if (other !== name) coStars[other] = (coStars[other] || 0) + 1
    }
  }

  const coStarList = Object.entries(coStars)
    .sort((a, b) => b[1] - a[1])
    .map(([n, c]) => ({ name: n, count: c }))

  return {
    name,
    stories,
    photoCount,
    storyCount: stories.length,
    earliest: earliest === Infinity ? null : earliest,
    latest: latest === -Infinity ? null : latest,
    coStars: coStarList,
  }
}

function Avatar({ name, size = 96, ring = true }) {
  const color = PERSON_COLORS[name] || '#888'
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        color: 'var(--color-bg)',
        fontFamily: 'var(--font-serif)',
        fontWeight: 600,
        fontSize: size * 0.42,
        boxShadow: ring ? `0 0 0 4px var(--color-bg), 0 0 0 5px ${color}55` : 'none',
      }}
      aria-hidden
    >
      {name[0]}
    </div>
  )
}

function PersonCard({ digest, index, onOpenStory }) {
  const [hovered, setHovered] = useState(false)
  const accent = PERSON_COLORS[digest.name] || 'var(--color-accent)'

  return (
    <motion.article
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${accent}`,
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-5 p-6">
        <Avatar name={digest.name} size={88} />
        <div className="flex-1 min-w-0">
          <h2
            className="text-3xl font-semibold leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
          >
            {digest.name}
          </h2>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-2">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                {digest.storyCount}
              </strong>{' '}
              {digest.storyCount === 1 ? 'story' : 'stories'}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                {digest.photoCount}
              </strong>{' '}
              photos
            </span>
            {digest.earliest && (
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {formatMonth(digest.earliest)}
                {digest.latest && digest.latest !== digest.earliest && (
                  <> – {formatMonth(digest.latest)}</>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Story strip */}
      {digest.stories.length > 0 && (
        <div className="px-6 pb-4">
          <h3
            className="text-[13px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Appears in
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            {digest.stories.map((story) => {
              const cover = story.photos[story.coverPhotoIndex] || story.photos[0]
              const moodColor = MOOD_COLORS[story.mood] || MOOD_COLORS.warm
              return (
                <button
                  key={story.id}
                  onClick={() => onOpenStory(story.id)}
                  className="rounded-lg overflow-hidden shrink-0 text-left cursor-pointer group"
                  style={{
                    width: 160,
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderTop: `2px solid ${moodColor}`,
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  }}
                >
                  <div style={{ height: 90 }} className="overflow-hidden">
                    <img
                      src={cover.url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105"
                      style={{ transition: 'transform 0.4s ease' }}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2.5">
                    <p
                      className="text-[13px] font-semibold truncate"
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
        </div>
      )}

      {/* Co-stars */}
      {digest.coStars.length > 0 && (
        <div
          className="px-6 py-3 flex items-center gap-3 flex-wrap"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <h3
            className="text-[13px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Often with
          </h3>
          {digest.coStars.map((co) => (
            <div
              key={co.name}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PERSON_COLORS[co.name] || 'var(--color-text-muted)' }}
              />
              <span className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
                {co.name}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                · {co.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.article>
  )
}

export default function PeoplePlaceholder() {
  const navigate = useNavigate()
  const digests = useMemo(() => allPeople.map(buildPersonDigest), [])

  const totalStories = storyArcs.length
  const totalAppearances = digests.reduce((s, d) => s + d.photoCount, 0)

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Page header */}
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
            People
          </h1>
          <p className="text-base mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {digests.length}
            </strong>{' '}
            {digests.length === 1 ? 'person' : 'people'} across{' '}
            <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {totalStories}
            </strong>{' '}
            stories ·{' '}
            <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {totalAppearances}
            </strong>{' '}
            photographed moments
          </p>
        </motion.header>

        {/* Avatar row — quick visual index */}
        <motion.div
          className="flex items-end gap-6 mb-10 pb-6"
          style={{ borderBottom: '1px solid var(--color-border)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {digests.map((d) => (
            <a
              key={d.name}
              href={`#person-${d.name}`}
              className="flex flex-col items-center gap-2"
              style={{ textDecoration: 'none' }}
            >
              <Avatar name={d.name} size={56} />
              <span
                className="text-[14px] font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {d.name}
              </span>
            </a>
          ))}
        </motion.div>

        {/* Person cards */}
        <div className="flex flex-col gap-8">
          {digests.map((digest, i) => (
            <div key={digest.name} id={`person-${digest.name}`}>
              <PersonCard
                digest={digest}
                index={i}
                onOpenStory={(id) => navigate(`/story/${id}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
