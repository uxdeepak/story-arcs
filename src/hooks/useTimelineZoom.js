import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Zoom levels for the River Timeline.
 * Each level defines a multiplier for spatial constants and a label.
 */
export const ZOOM_LEVELS = [
  { multiplier: 0.5, label: 'Overview' },
  { multiplier: 1.0, label: 'Default' },
  { multiplier: 1.8, label: 'Detailed' },
  { multiplier: 3.0, label: 'Photos' },
]

const DEFAULT_LEVEL = 1
const WHEEL_THRESHOLD = 80 // cumulative deltaY to trigger a zoom step

/**
 * useTimelineZoom — manages discrete zoom levels with gesture support.
 *
 * Supports:
 *  - Ctrl+wheel / trackpad pinch (detects via e.ctrlKey on wheel events)
 *  - Touch pinch (two-finger gesture)
 *  - Button clicks (+/-)
 *
 * Preserves scroll position by adjusting scrollLeft to keep the viewport
 * center at the same logical position on the timeline.
 */
export default function useTimelineZoom(scrollRef) {
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_LEVEL)
  const wheelAccum = useRef(0)
  const prevMultiplier = useRef(ZOOM_LEVELS[DEFAULT_LEVEL].multiplier)
  const touchStartDist = useRef(null)
  const touchStartLevel = useRef(DEFAULT_LEVEL)

  const zoomMultiplier = ZOOM_LEVELS[zoomLevel].multiplier

  // Preserve scroll position when zoom changes
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const oldMult = prevMultiplier.current
    const newMult = zoomMultiplier

    if (oldMult !== newMult) {
      const viewportCenter = el.scrollLeft + el.clientWidth / 2
      const fraction = viewportCenter / (el.scrollWidth || 1)
      // We need to estimate the new total scroll width
      const newScrollWidth = el.scrollWidth * (newMult / oldMult)
      const newScrollLeft = fraction * newScrollWidth - el.clientWidth / 2
      // Apply after the DOM updates with new width
      requestAnimationFrame(() => {
        el.scrollLeft = Math.max(0, newScrollLeft)
      })
      prevMultiplier.current = newMult
    }
  }, [zoomMultiplier, scrollRef])

  const zoomIn = useCallback(() => {
    setZoomLevel((l) => Math.min(l + 1, ZOOM_LEVELS.length - 1))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel((l) => Math.max(l - 1, 0))
  }, [])

  // Ctrl+wheel / trackpad pinch handler
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e) => {
      if (!e.ctrlKey) return
      e.preventDefault()

      wheelAccum.current += e.deltaY
      if (Math.abs(wheelAccum.current) >= WHEEL_THRESHOLD) {
        if (wheelAccum.current < 0) {
          setZoomLevel((l) => Math.min(l + 1, ZOOM_LEVELS.length - 1))
        } else {
          setZoomLevel((l) => Math.max(l - 1, 0))
        }
        wheelAccum.current = 0
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scrollRef])

  // Touch pinch handler
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const getTouchDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.hypot(dx, dy)
    }

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        touchStartDist.current = getTouchDist(e.touches)
        touchStartLevel.current = zoomLevel
      }
    }

    const onTouchMove = (e) => {
      if (e.touches.length !== 2 || touchStartDist.current === null) return
      e.preventDefault()
      const currentDist = getTouchDist(e.touches)
      const ratio = currentDist / touchStartDist.current

      if (ratio > 1.4) {
        const newLevel = Math.min(touchStartLevel.current + 1, ZOOM_LEVELS.length - 1)
        setZoomLevel(newLevel)
        touchStartDist.current = currentDist
        touchStartLevel.current = newLevel
      } else if (ratio < 0.7) {
        const newLevel = Math.max(touchStartLevel.current - 1, 0)
        setZoomLevel(newLevel)
        touchStartDist.current = currentDist
        touchStartLevel.current = newLevel
      }
    }

    const onTouchEnd = () => {
      touchStartDist.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [scrollRef, zoomLevel])

  return {
    zoomLevel,
    zoomMultiplier,
    zoomIn,
    zoomOut,
    canZoomIn: zoomLevel < ZOOM_LEVELS.length - 1,
    canZoomOut: zoomLevel > 0,
    levelLabel: ZOOM_LEVELS[zoomLevel].label,
    totalLevels: ZOOM_LEVELS.length,
  }
}
