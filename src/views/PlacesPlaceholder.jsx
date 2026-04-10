import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { storyArcs, loosePhotos } from '../data/demoData.js'

const MOOD_COLORS = {
  warm: '#C4724E',
  calm: '#6B8A7A',
  euphoric: '#D4A03E',
}

function formatMonth(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** Extract the city/region from a "Neighborhood, City" style string */
function rootPlace(loc) {
  if (!loc) return 'Unknown'
  const parts = loc.split(',').map((p) => p.trim())
  return parts[parts.length - 1] || loc
}

/**
 * Build a digest per place (root city/region):
 *  - stories whose primaryLocation rolls up here
 *  - all sub-locations seen in photos at this place
 *  - total photo count
 *  - timespan
 *  - dominant mood (most common across stories)
 */
function buildPlaceDigests() {
  const places = {}

  for (const story of storyArcs) {
    const root = rootPlace(story.primaryLocation)
    if (!places[root]) {
      places[root] = {
        name: root,
        stories: [],
        subLocations: new Set(),
        photoCount: 0,
        earliest: Infinity,
        latest: -Infinity,
        moodTally: {},
      }
    }
    const p = places[root]
    p.stories.push(story)
    p.moodTally[story.mood] = (p.moodTally[story.mood] || 0) + 1

    for (const photo of story.photos) {
      p.photoCount += 1
      if (photo.location && photo.location !== root) {
        p.subLocations.add(photo.location)
      }
      const t = new Date(photo.timestamp).getTime()
      if (t < p.earliest) p.earliest = t
      if (t > p.latest) p.latest = t
    }
  }

  // Roll loose photos in too — they have a place but no story
  for (const photo of loosePhotos) {
    const root = rootPlace(photo.location)
    if (!places[root]) {
      places[root] = {
        name: root,
        stories: [],
        subLocations: new Set(),
        photoCount: 0,
        earliest: Infinity,
        latest: -Infinity,
        moodTally: {},
      }
    }
    places[root].photoCount += 1
    if (photo.location && photo.location !== root) {
      places[root].subLocations.add(photo.location)
    }
    const t = new Date(photo.timestamp).getTime()
    if (t < places[root].earliest) places[root].earliest = t
    if (t > places[root].latest) places[root].latest = t
  }

  return Object.values(places)
    .map((p) => {
      const dominantMood =
        Object.entries(p.moodTally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'warm'
      return {
        ...p,
        subLocations: [...p.subLocations],
        dominantMood,
      }
    })
    .sort((a, b) => b.photoCount - a.photoCount)
}

function PlaceCard({ place, index, onOpenStory }) {
  const accent = MOOD_COLORS[place.dominantMood] || MOOD_COLORS.warm

  // Pick up to 3 hero photos for the visual band — covers from stories here
  const heroes = place.stories
    .slice(0, 3)
    .map((s) => s.photos[s.coverPhotoIndex] || s.photos[0])
    .filter(Boolean)

  return (
    <motion.article
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Visual band — composite of hero photos */}
      {heroes.length > 0 && (
        <div className="relative" style={{ height: 180 }}>
          <div className="absolute inset-0 flex">
            {heroes.map((photo, i) => (
              <div
                key={photo.id}
                className="flex-1 overflow-hidden"
                style={{
                  borderRight:
                    i < heroes.length - 1 ? '2px solid var(--color-bg)' : 'none',
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
          {/* Readability overlay — dark gradient bottom + mood tint */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%), linear-gradient(to bottom, transparent 60%, ${accent}40 100%)`,
            }}
          />
          {/* Place name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2
              className="text-3xl lg:text-4xl font-semibold tracking-tight leading-none"
              style={{
                fontFamily: 'var(--font-serif)',
                color: '#fff',
                textShadow: '0 2px 14px rgba(0,0,0,0.6)',
              }}
            >
              {place.name}
            </h2>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div
        className="px-5 py-3 flex flex-wrap items-baseline gap-x-5 gap-y-1"
        style={{
          borderBottom: '1px solid var(--color-border)',
          borderLeft: `4px solid ${accent}`,
        }}
      >
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
            {place.stories.length}
          </strong>{' '}
          {place.stories.length === 1 ? 'story' : 'stories'}
        </span>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
            {place.photoCount}
          </strong>{' '}
          photos
        </span>
        {place.subLocations.length > 0 && (
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {place.subLocations.length}
            </strong>{' '}
            spots
          </span>
        )}
        {place.earliest && place.earliest !== Infinity && (
          <span className="text-sm ml-auto" style={{ color: 'var(--color-text-muted)' }}>
            {formatMonth(place.earliest)}
            {place.latest !== place.earliest && <> – {formatMonth(place.latest)}</>}
          </span>
        )}
      </div>

      {/* Stories strip */}
      {place.stories.length > 0 && (
        <div className="px-5 py-4">
          <h3
            className="text-[13px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Stories from here
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            {place.stories.map((story) => {
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
                      {formatMonth(story.dateRange.start)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sub-locations chips */}
      {place.subLocations.length > 0 && (
        <div
          className="px-5 py-3 flex items-center gap-2 flex-wrap"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <h3
            className="text-[13px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Spots
          </h3>
          {place.subLocations.map((loc) => (
            <span
              key={loc}
              className="text-[14px] px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {loc.replace(`, ${place.name}`, '').replace(place.name, '').trim() || loc}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  )
}

export default function PlacesPlaceholder() {
  const navigate = useNavigate()
  const places = useMemo(() => buildPlaceDigests(), [])
  const totalPhotos = places.reduce((s, p) => s + p.photoCount, 0)

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
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
            Places
          </h1>
          <p className="text-base mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {places.length}
            </strong>{' '}
            {places.length === 1 ? 'place' : 'places'} ·{' '}
            <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {totalPhotos}
            </strong>{' '}
            photos
          </p>
        </motion.header>

        <div className="flex flex-col gap-8">
          {places.map((place, i) => (
            <PlaceCard
              key={place.name}
              place={place}
              index={i}
              onOpenStory={(id) => navigate(`/story/${id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
