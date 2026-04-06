import { useMemo } from 'react'

const YEAR_START = new Date('2024-01-01').getTime()
const YEAR_END = new Date('2024-12-31T23:59:59').getTime()
const YEAR_MS = YEAR_END - YEAR_START

// Number of buckets across the year for density sampling
const BUCKETS = 52 // ~weekly

export default function DensityStrip({ stories, loosePhotos, totalWidth, paddingLeft, riverY }) {
  const densityData = useMemo(() => {
    // Collect all photo timestamps
    const allTimestamps = []
    for (const story of stories) {
      for (const photo of story.photos) {
        allTimestamps.push(new Date(photo.timestamp).getTime())
      }
    }
    for (const photo of loosePhotos) {
      allTimestamps.push(new Date(photo.timestamp).getTime())
    }

    // Bucket photos into weekly bins
    const buckets = new Array(BUCKETS).fill(0)
    const bucketWidth = YEAR_MS / BUCKETS

    for (const ts of allTimestamps) {
      const idx = Math.min(Math.floor((ts - YEAR_START) / bucketWidth), BUCKETS - 1)
      if (idx >= 0) buckets[idx]++
    }

    const maxCount = Math.max(...buckets, 1)
    return buckets.map((count) => count / maxCount)
  }, [stories, loosePhotos])

  const usableWidth = totalWidth - paddingLeft * 2
  const barWidth = usableWidth / BUCKETS

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{ top: riverY != null ? riverY + 4 : 'calc(50% + 4px)', height: '20px' }}
    >
      <svg
        width={totalWidth}
        height={20}
        className="absolute top-0 left-0"
      >
        {densityData.map((intensity, i) => {
          if (intensity === 0) return null
          const x = paddingLeft + i * barWidth
          return (
            <rect
              key={i}
              x={x}
              y={20 - intensity * 18}
              width={barWidth - 1}
              height={intensity * 18}
              rx={1}
              fill="var(--color-accent)"
              opacity={intensity * 0.15 + 0.02}
            />
          )
        })}
      </svg>
    </div>
  )
}
