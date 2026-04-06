import { useEffect, useCallback, useState, useRef } from 'react'

const SCROLL_STEP = 300

/**
 * Manages horizontal scroll state for the River Timeline — tracks position,
 * translates vertical wheel input to horizontal scroll, handles keyboard
 * arrows/Home/End, and provides minimap drag support.
 */
export default function useTimelineScroll(scrollRef, totalWidth) {
  const [scrollLeft, setScrollLeft] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragScrollStart = useRef(0)

  // Track scroll position and viewport size
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => setScrollLeft(el.scrollLeft)
    const onResize = () => setViewportWidth(el.clientWidth)

    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    onResize()
    onScroll()

    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [scrollRef])

  // Horizontal wheel scrolling — translate vertical wheel into horizontal scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e) => {
      // Ctrl+wheel is handled by zoom hook
      if (e.ctrlKey) return
      // If shift is held or it's a horizontal scroll, let it through naturally
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return

      e.preventDefault()
      // Apply vertical delta as horizontal scroll with momentum multiplier
      el.scrollLeft += e.deltaY * 1.5
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scrollRef])

  // Keyboard navigation
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const delta = e.key === 'ArrowRight' ? SCROLL_STEP : -SCROLL_STEP
        el.scrollBy({ left: delta, behavior: 'smooth' })
      }
      if (e.key === 'Home') {
        e.preventDefault()
        el.scrollTo({ left: 0, behavior: 'smooth' })
      }
      if (e.key === 'End') {
        e.preventDefault()
        el.scrollTo({ left: totalWidth, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [scrollRef, totalWidth])

  // Scroll to a specific x position (for minimap clicks)
  const scrollTo = useCallback(
    (x) => {
      const el = scrollRef.current
      if (!el) return
      el.scrollTo({ left: x - el.clientWidth / 2, behavior: 'smooth' })
    },
    [scrollRef]
  )

  // Minimap drag handlers
  const startMinimapDrag = useCallback(
    (e, minimapWidth) => {
      isDragging.current = true
      dragStartX.current = e.clientX
      const el = scrollRef.current
      if (!el) return
      dragScrollStart.current = el.scrollLeft

      const onMove = (moveEvent) => {
        if (!isDragging.current) return
        const dx = moveEvent.clientX - dragStartX.current
        const scale = totalWidth / minimapWidth
        el.scrollLeft = dragScrollStart.current + dx * scale
      }

      const onUp = () => {
        isDragging.current = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [scrollRef, totalWidth]
  )

  const scrollFraction = totalWidth > 0 ? scrollLeft / totalWidth : 0
  const viewportFraction = totalWidth > 0 ? viewportWidth / totalWidth : 1

  return {
    scrollLeft,
    viewportWidth,
    scrollFraction,
    viewportFraction,
    scrollTo,
    startMinimapDrag,
  }
}
