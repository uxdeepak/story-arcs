import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const PERSON_COLORS = {
  Maya: '#C4724E',
  Jon: '#6B8A7A',
  Alex: '#D4A03E',
}

function formatShortTime(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/**
 * PhotoNode — draggable photo card positioned by d3-force layout.
 * Supports drag-to-rearrange, click-to-lightbox, and parallax depth effect.
 */
export default function PhotoNode({
  photo,
  x,
  y,
  size,
  isFocal,
  isClusterHighlighted,
  index,
  onClick,
  onHoverCluster,
  onDragStart,
  isDragging,
  mouseOffset,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [settled, setSettled] = useState(false)

  // Enable CSS position transitions after initial mount animation completes
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 900 + index * 40)
    return () => clearTimeout(t)
  }, [index])

  // Parallax: smaller photos shift more (opposite direction)
  const parallaxStrength = isFocal ? 3 : 5
  const px = mouseOffset ? -mouseOffset.x * parallaxStrength : 0
  const py = mouseOffset ? -mouseOffset.y * parallaxStrength : 0

  return (
    <motion.div
      className="absolute"
      style={{
        left: x - size / 2 + px,
        top: y - size / 2 + py,
        width: size,
        height: size,
        zIndex: isDragging ? 5 : isHovered ? 30 : isFocal ? 12 : 10,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        // Spring-like position transition after initial settle
        ...(settled
          ? {
              transition:
                'left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }
          : {}),
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: isDragging ? 0.3 : 1,
        scale: isDragging ? 0.95 : 1,
      }}
      transition={{
        duration: 0.5,
        delay: settled ? 0 : 0.3 + index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => {
        if (!isDragging) {
          setIsHovered(true)
          onHoverCluster?.(photo.cluster)
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        onHoverCluster?.(null)
      }}
      role="button"
      tabIndex={0}
      aria-label={`Photo at ${photo.location}`}
      onPointerDown={(e) => onDragStart?.(photo.id, e)}
      onClick={() => onClick(photo)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(photo)
        }
      }}
    >
      {/* Photo card */}
      <motion.div
        className="w-full h-full rounded-lg overflow-hidden"
        style={{
          border:
            isClusterHighlighted && !isHovered
              ? '2px solid var(--color-accent)'
              : '1px solid var(--color-border)',
          boxShadow: isHovered
            ? 'var(--shadow-photo-hover)'
            : isFocal
              ? 'var(--shadow-photo-focal)'
              : 'var(--shadow-photo)',
        }}
        animate={{
          scale: isHovered ? 1.08 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={photo.url}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </motion.div>

      {/* Hover tooltip */}
      {!isDragging && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap"
          style={{
            bottom: size + 8,
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-tooltip)',
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 6,
          }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {formatShortTime(photo.timestamp)}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
            {photo.location}
          </p>
          {photo.people.length > 0 && (
            <div className="flex gap-1 mt-1">
              {photo.people.map((person) => (
                <div
                  key={person}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PERSON_COLORS[person] || 'var(--color-text-muted)' }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
