import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ConnectionThreads — SVG bezier curves connecting related story islands
 * on the timeline. Threads route through the river line and highlight
 * with a glow effect + reason label on hover.
 */
export default function ConnectionThreads({
  stories,
  islandLayout,
  hoveredStoryId,
  gapFromRiver,
  totalWidth,
  canvasHeight,
}) {
  const riverY = canvasHeight / 2

  // Build a lookup: storyId -> layout position
  const layoutMap = useMemo(() => {
    const map = {}
    for (const item of islandLayout) {
      map[item.story.id] = item
    }
    return map
  }, [islandLayout])

  // Build all thread lines from connections (deduplicated)
  const threads = useMemo(() => {
    const seen = new Set()
    const result = []

    for (const story of stories) {
      for (const conn of story.connections) {
        const key = [story.id, conn.targetStoryId].sort().join('::')
        if (seen.has(key)) continue
        seen.add(key)

        const from = layoutMap[story.id]
        const to = layoutMap[conn.targetStoryId]
        if (!from || !to) continue

        result.push({
          key,
          fromId: story.id,
          toId: conn.targetStoryId,
          from,
          to,
          reason: conn.reason,
        })
      }
    }
    return result
  }, [stories, layoutMap])

  // Get the center point of an island
  function getIslandCenter(item) {
    const cx = item.x + item.width / 2
    const h = item.height || 190
    const stackGap = 16
    const stackOffset = item.level * (h + stackGap)
    let cy
    if (item.side === 'above') {
      cy = riverY - gapFromRiver - h / 2 - stackOffset
    } else {
      cy = riverY + gapFromRiver + h / 2 + stackOffset
    }
    return { cx, cy }
  }

  // Edge point: the edge of the island closest to the other island
  function getIslandEdge(item, targetCx) {
    const { cx, cy } = getIslandCenter(item)
    // Connect from the side of the card facing the target
    const edgeX = targetCx > cx
      ? item.x + item.width // right edge
      : item.x             // left edge
    return { x: edgeX, y: cy }
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: totalWidth, height: canvasHeight }}
    >
      <defs>
        <filter id="thread-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {threads.map((thread) => {
        const fromCenter = getIslandCenter(thread.from)
        const toCenter = getIslandCenter(thread.to)

        const fromEdge = getIslandEdge(thread.from, toCenter.cx)
        const toEdge = getIslandEdge(thread.to, fromCenter.cx)

        const isHighlighted =
          hoveredStoryId === thread.fromId || hoveredStoryId === thread.toId

        // Cubic bezier curve: route through the river line for drama
        const midX = (fromEdge.x + toEdge.x) / 2
        // Control points pull toward the river
        const cp1x = fromEdge.x + (midX - fromEdge.x) * 0.5
        const cp1y = riverY
        const cp2x = toEdge.x - (toEdge.x - midX) * 0.5
        const cp2y = riverY

        const pathD = `M ${fromEdge.x} ${fromEdge.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toEdge.x} ${toEdge.y}`

        // Label position at midpoint of curve
        const labelX = midX
        const labelY = riverY + (thread.from.side === thread.to.side ? -20 : 0)

        return (
          <g key={thread.key}>
            {/* Thread line */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={isHighlighted ? 1.5 : 1}
              strokeDasharray={isHighlighted ? 'none' : '6 4'}
              filter={isHighlighted ? 'url(#thread-glow)' : undefined}
              initial={false}
              animate={{
                opacity: isHighlighted ? 0.6 : 0.12,
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Connection reason label on hover */}
            <AnimatePresence>
              {isHighlighted && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <rect
                    x={labelX - thread.reason.length * 3.2 - 8}
                    y={labelY - 11}
                    width={thread.reason.length * 6.4 + 16}
                    height={22}
                    rx={11}
                    fill="var(--color-surface-elevated)"
                    stroke="var(--color-border)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={labelX}
                    y={labelY + 3}
                    textAnchor="middle"
                    fill="var(--color-text-secondary)"
                    fontSize={10}
                    fontFamily="var(--font-sans)"
                  >
                    {thread.reason}
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
          </g>
        )
      })}
    </svg>
  )
}
