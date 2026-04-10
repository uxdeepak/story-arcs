const YEAR_START = new Date('2024-01-01').getTime()
const YEAR_END = new Date('2024-12-31T23:59:59').getTime()
const YEAR_MS = YEAR_END - YEAR_START

export default function LoosePhotoMarkers({ loosePhotos, totalWidth, paddingLeft, riverY }) {
  if (loosePhotos.length === 0) return null

  // Group loose photos by proximity (within 30 days of each other)
  const groups = []
  const sorted = [...loosePhotos].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  )

  let currentGroup = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].timestamp).getTime()
    const curr = new Date(sorted[i].timestamp).getTime()
    if (curr - prev < 30 * 24 * 3600 * 1000) {
      currentGroup.push(sorted[i])
    } else {
      groups.push(currentGroup)
      currentGroup = [sorted[i]]
    }
  }
  groups.push(currentGroup)

  return (
    <>
      {groups.map((group, gi) => {
        const midTs =
          group.reduce((s, p) => s + new Date(p.timestamp).getTime(), 0) /
          group.length
        const fraction = (midTs - YEAR_START) / YEAR_MS
        const x = paddingLeft + fraction * (totalWidth - paddingLeft * 2)

        return (
          <div
            key={gi}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: x,
              top: riverY != null ? riverY + 28 : 'calc(50% + 28px)',
              transform: 'translateX(-50%)',
            }}
          >
            {/* Small diamond marker */}
            <div
              className="w-1.5 h-1.5 rotate-45"
              style={{
                backgroundColor: 'var(--color-text-muted)',
                opacity: 0.7,
              }}
            />
            {/* Label */}
            <span
              className="text-[14px] mt-1 whitespace-nowrap"
              style={{
                color: 'var(--color-text-muted)',
              }}
            >
              {group.length} loose photo{group.length > 1 ? 's' : ''}
            </span>
          </div>
        )
      })}
    </>
  )
}
