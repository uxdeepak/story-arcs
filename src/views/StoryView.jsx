import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  forceCollide,
} from 'd3-force'
import { getStoryById, clusterAnnotations } from '../data/demoData.js'
import PhotoNode from '../components/PhotoNode.jsx'
import Lightbox from '../components/Lightbox.jsx'

// ─── Constants ───────────────────────────────────────────────────────
const PHOTO_SIZE_FOCAL = 160
const PHOTO_SIZE_NORMAL = 110
const CLUSTER_SPREAD = 220
const CLUSTER_DROP_RADIUS = 140
const TRAY_HEIGHT = 48
const TRAY_HEIGHT_EXPANDED = 96
const PERSON_COLORS = {
  Maya: '#C4724E',
  Jon: '#6B8A7A',
  Alex: '#D4A03E',
}

function formatDateRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const opts = { month: 'long', day: 'numeric' }
  if (s.getTime() === e.getTime()) {
    return s.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
  }
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.toLocaleDateString('en-US', opts)} – ${e.getDate()}, ${e.getFullYear()}`
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

// ─── Compute cluster centers in a circular arrangement ───────────────
function computeClusterCenters(clusterNames, centerX, centerY) {
  const centers = {}
  const count = clusterNames.length

  if (count === 1) {
    centers[clusterNames[0]] = { x: centerX, y: centerY }
    return centers
  }

  const radius = CLUSTER_SPREAD * Math.max(1, count / 4)
  clusterNames.forEach((name, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    centers[name] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    }
  })
  return centers
}

// ─── Run d3-force to position photos ─────────────────────────────────
function runForceLayout(photos, canvasWidth, canvasHeight, prevPositions = {}) {
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  const clusterNames = [...new Set(photos.map((p) => p.cluster))]
  const clusterCenters = computeClusterCenters(clusterNames, centerX, centerY)

  const firstInCluster = new Set()
  const focalPhotos = new Set()
  for (const photo of photos) {
    if (!firstInCluster.has(photo.cluster)) {
      firstInCluster.add(photo.cluster)
      focalPhotos.add(photo.id)
    }
  }

  const nodes = photos.map((photo) => {
    const isFocal = focalPhotos.has(photo.id)
    const size = isFocal ? PHOTO_SIZE_FOCAL : PHOTO_SIZE_NORMAL
    const center = clusterCenters[photo.cluster]
    const prev = prevPositions[photo.id]
    return {
      id: photo.id,
      photo,
      isFocal,
      size,
      x: prev?.x ?? center.x + (Math.random() - 0.5) * 80,
      y: prev?.y ?? center.y + (Math.random() - 0.5) * 80,
      targetX: center.x,
      targetY: center.y,
    }
  })

  const sim = forceSimulation(nodes)
    .force('x', forceX((d) => d.targetX).strength(0.3))
    .force('y', forceY((d) => d.targetY).strength(0.3))
    .force('charge', forceManyBody().strength(-40))
    .force('collide', forceCollide((d) => d.size / 2 + 8).strength(0.8))
    .stop()

  for (let i = 0; i < 120; i++) sim.tick()

  const clusterLabels = clusterNames.map((name) => {
    const clusterNodes = nodes.filter((n) => n.photo.cluster === name)
    const avgX = clusterNodes.reduce((s, n) => s + n.x, 0) / clusterNodes.length
    const topMost = Math.min(...clusterNodes.map((n) => n.y - n.size / 2))
    return {
      name,
      x: avgX,
      y: topMost - 20,
      count: clusterNodes.length,
    }
  })

  return { nodes, clusterLabels, clusterCenters }
}

// ─── Inline Editable ─────────────────────────────────────────────────
function InlineEditable({ value, onChange, className, style }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!editing) setText(value)
  }, [value, editing])

  if (!editing) {
    return (
      <span
        className={className}
        style={{ ...style, cursor: 'text' }}
        onClick={(e) => {
          e.stopPropagation()
          setEditing(true)
        }}
      >
        {value}
      </span>
    )
  }

  return (
    <input
      ref={(el) => {
        inputRef.current = el
        el?.focus()
        el?.select()
      }}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        setEditing(false)
        const t = text.trim()
        if (t && t !== value) onChange(t)
        else setText(value)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          inputRef.current?.blur()
        }
        if (e.key === 'Escape') {
          setText(value)
          setEditing(false)
        }
      }}
      className={className}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--color-accent)',
        outline: 'none',
        padding: 0,
        margin: 0,
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
      }}
      size={Math.max(text.length, 3)}
    />
  )
}

/**
 * StoryView — single story exploration view. Uses d3-force to spatially
 * arrange photos by cluster. Supports drag-to-rearrange between clusters,
 * drag-to-tray removal, inline title/cluster editing, parallax depth
 * on mouse move, and an integrated lightbox.
 */
export default function StoryView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const story = getStoryById(id)
  const containerRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 })
  const [hoveredCluster, setHoveredCluster] = useState(null)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [favorites, setFavorites] = useState(new Set())

  // ── Editable state ──
  const [editablePhotos, setEditablePhotos] = useState([])
  const [editableTitle, setEditableTitle] = useState('')
  const [removedPhotos, setRemovedPhotos] = useState([])

  // ── Parallax mouse tracking ──
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

  // ── Drag state ──
  const [dragState, setDragState] = useState(null)
  const [dragTarget, setDragTarget] = useState(null) // 'tray' | clusterName | null
  const dragTargetRef = useRef(null)
  const dragActiveRef = useRef(false)
  const prevPositionsRef = useRef({})

  // Init editable state from story
  useEffect(() => {
    if (story) {
      setEditablePhotos(story.photos.map((p) => ({ ...p })))
      setEditableTitle(story.title)
      setRemovedPhotos([])
      prevPositionsRef.current = {}
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track container size
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setCanvasSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Parallax: track mouse position relative to container center (RAF-throttled)
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width - 0.5
      mouseRef.current.y = (e.clientY - rect.top) / rect.height - 0.5
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setMouseOffset({ x: mouseRef.current.x, y: mouseRef.current.y })
          rafRef.current = null
        })
      }
    }
    el.addEventListener('mousemove', onMove)
    return () => {
      el.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Run force layout
  const layout = useMemo(() => {
    if (!editablePhotos.length || canvasSize.width < 100) return null
    const result = runForceLayout(
      editablePhotos,
      canvasSize.width,
      canvasSize.height - TRAY_HEIGHT,
      prevPositionsRef.current
    )
    // Store positions for next run so photos stay stable
    prevPositionsRef.current = {}
    for (const node of result.nodes) {
      prevPositionsRef.current[node.id] = { x: node.x, y: node.y }
    }
    return result
  }, [editablePhotos, canvasSize.width, canvasSize.height])

  const annotations = story ? clusterAnnotations[story.id] || {} : {}

  // Photo click — blocked during drag
  const handlePhotoClick = useCallback((photo) => {
    if (dragActiveRef.current) return
    setLightboxPhoto(photo)
  }, [])

  const handleLightboxNavigate = useCallback((photo) => {
    setLightboxPhoto(photo)
  }, [])

  // Favorites toggle
  const handleToggleFavorite = useCallback((photoId) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) next.delete(photoId)
      else next.add(photoId)
      return next
    })
  }, [])

  // Remove photo from lightbox (moves to tray + navigates)
  const handleRemoveFromLightbox = useCallback(
    (photo) => {
      const idx = editablePhotos.findIndex((p) => p.id === photo.id)
      const remaining = editablePhotos.filter((p) => p.id !== photo.id)
      setRemovedPhotos((prev) => [...prev, { ...photo }])
      setEditablePhotos(remaining)
      if (remaining.length === 0) {
        setLightboxPhoto(null)
      } else {
        setLightboxPhoto(remaining[Math.min(idx, remaining.length - 1)])
      }
    },
    [editablePhotos]
  )

  // ── Drag handlers ──────────────────────────────────────────────────
  const handleDragStart = useCallback(
    (photoId, e) => {
      if (lightboxPhoto) return
      const node = layout?.nodes.find((n) => n.id === photoId)
      if (!node) return

      const rect = containerRef.current.getBoundingClientRect()
      const startX = e.clientX
      const startY = e.clientY
      const photoCluster = node.photo.cluster

      const onMove = (ev) => {
        ev.preventDefault()
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (!dragActiveRef.current && dx * dx + dy * dy < 25) return
        dragActiveRef.current = true

        const cx = ev.clientX - rect.left
        const cy = ev.clientY - rect.top

        setDragState({
          photoId,
          x: cx,
          y: cy,
          clientX: ev.clientX,
          clientY: ev.clientY,
          size: node.size,
          url: node.photo.url,
        })

        // Determine drop target
        let target = null
        const trayZone = rect.height - TRAY_HEIGHT_EXPANDED
        if (cy > trayZone) {
          target = 'tray'
        } else if (layout?.clusterCenters) {
          let nearest = null
          let nearestDist = Infinity
          for (const [name, center] of Object.entries(layout.clusterCenters)) {
            const d = Math.hypot(cx - center.x, cy - center.y)
            if (d < nearestDist && d < CLUSTER_DROP_RADIUS) {
              nearest = name
              nearestDist = d
            }
          }
          if (nearest && nearest !== photoCluster) target = nearest
        }

        dragTargetRef.current = target
        setDragTarget(target)
      }

      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)

        if (dragActiveRef.current) {
          const target = dragTargetRef.current

          if (target === 'tray') {
            // Remove photo from story
            const photo = editablePhotos.find((p) => p.id === photoId)
            if (photo) {
              setRemovedPhotos((prev) => [...prev, { ...photo }])
              setEditablePhotos((prev) => prev.filter((p) => p.id !== photoId))
            }
          } else if (target) {
            // Reassign to new cluster
            setEditablePhotos((prev) =>
              prev.map((p) => (p.id === photoId ? { ...p, cluster: target } : p))
            )
          }

          // Brief delay before re-enabling clicks
          setTimeout(() => {
            dragActiveRef.current = false
          }, 60)
        } else {
          dragActiveRef.current = false
        }

        setDragState(null)
        setDragTarget(null)
        dragTargetRef.current = null
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [layout, lightboxPhoto, editablePhotos]
  )

  // Cluster rename
  const handleClusterRename = useCallback((oldName, newName) => {
    if (!newName || newName === oldName) return
    setEditablePhotos((prev) =>
      prev.map((p) => (p.cluster === oldName ? { ...p, cluster: newName } : p))
    )
  }, [])

  if (!story) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>Story not found</p>
      </div>
    )
  }

  return (
    <motion.div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.header
        className="flex items-start gap-4 lg:gap-6 px-6 lg:px-10 pt-6 pb-4 shrink-0"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Back button */}
        <button
          className="mt-1 w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          onClick={() => navigate('/')}
          aria-label="Back to timeline"
        >
          ←
        </button>

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <InlineEditable
            value={editableTitle}
            onChange={setEditableTitle}
            className="text-2xl lg:text-4xl font-semibold tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
          />
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {formatDateRange(story.dateRange.start, story.dateRange.end)}
            <span style={{ color: 'var(--color-text-secondary)', margin: '0 6px' }}>·</span>
            {story.primaryLocation}
            <span style={{ color: 'var(--color-text-secondary)', margin: '0 6px' }}>·</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {editablePhotos.length} photos
            </span>
          </p>
        </div>

        {/* People avatars */}
        {story.people.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 mt-1">
            {story.people.map((person) => (
              <div key={person} className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[14px] font-semibold"
                  style={{
                    backgroundColor: PERSON_COLORS[person] || 'var(--color-text-muted)',
                    color: 'var(--color-bg)',
                  }}
                >
                  {person[0]}
                </div>
                <span
                  className="text-[14px] hidden lg:inline"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {person}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.header>

      {/* ── Photo Canvas ───────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {layout && (
          <>
            {/* Cluster drop zone glow */}
            <AnimatePresence>
              {dragState &&
                dragTarget &&
                dragTarget !== 'tray' &&
                layout.clusterCenters[dragTarget] && (
                  <motion.div
                    key="cluster-glow"
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: layout.clusterCenters[dragTarget].x,
                      top: layout.clusterCenters[dragTarget].y,
                      width: CLUSTER_DROP_RADIUS * 2,
                      height: CLUSTER_DROP_RADIUS * 2,
                      transform: 'translate(-50%, -50%)',
                      background:
                        'radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%)',
                      border: '1px solid var(--color-thread-line)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
            </AnimatePresence>

            {/* Cluster labels (editable) */}
            {layout.clusterLabels.map((label) => (
              <motion.div
                key={label.name}
                className="absolute flex flex-col items-center"
                style={{
                  left: label.x,
                  top: label.y,
                  transform: 'translateX(-50%)',
                  pointerEvents: dragState ? 'none' : 'auto',
                  zIndex: 5,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: dragTarget === label.name ? 1.15 : 1,
                }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <InlineEditable
                  value={label.name}
                  onChange={(newName) => handleClusterRename(label.name, newName)}
                  className="text-[15px] font-semibold tracking-tight"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
                />
              </motion.div>
            ))}

            {/* Cluster annotations (whispered context) */}
            <AnimatePresence>
              {hoveredCluster && annotations[hoveredCluster] && (
                <motion.div
                  key={hoveredCluster}
                  className="absolute pointer-events-none"
                  style={{
                    left:
                      layout.clusterLabels.find((l) => l.name === hoveredCluster)?.x || 0,
                    top:
                      (layout.clusterLabels.find((l) => l.name === hoveredCluster)?.y || 0) -
                      22,
                    transform: 'translateX(-50%)',
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.35 }}
                >
                  <span
                    className="text-[13px] italic whitespace-nowrap"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {annotations[hoveredCluster]}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Photo nodes */}
            {layout.nodes.map((node, i) => (
              <PhotoNode
                key={node.id}
                photo={node.photo}
                x={node.x}
                y={node.y}
                size={node.size}
                isFocal={node.isFocal}
                isClusterHighlighted={
                  hoveredCluster === node.photo.cluster ||
                  dragTarget === node.photo.cluster
                }
                index={i}
                onClick={handlePhotoClick}
                onHoverCluster={setHoveredCluster}
                onDragStart={handleDragStart}
                isDragging={dragState?.photoId === node.id}
                mouseOffset={mouseOffset}
              />
            ))}
          </>
        )}

        {/* ── Drag overlay (follows cursor) ──────────────────────── */}
        <AnimatePresence>
          {dragState && (
            <motion.div
              className="fixed pointer-events-none"
              style={{
                left: dragState.clientX - dragState.size / 2,
                top: dragState.clientY - dragState.size / 2,
                width: dragState.size,
                height: dragState.size,
                zIndex: 100,
              }}
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: 1.05, rotate: 2.5 }}
              exit={{ scale: 0.9, rotate: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div
                className="w-full h-full rounded-lg overflow-hidden"
                style={{
                  boxShadow: 'var(--shadow-photo-hover)',
                  border: '2px solid var(--color-accent)',
                }}
              >
                <img
                  src={dragState.url}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loose photos tray ──────────────────────────────────── */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 flex items-center overflow-hidden"
          style={{
            backgroundColor:
              dragTarget === 'tray'
                ? 'var(--color-accent-subtle)'
                : 'var(--color-surface)',
            borderTop:
              dragTarget === 'tray'
                ? '2px solid var(--color-accent)'
                : dragState || removedPhotos.length
                  ? '1px solid var(--color-border)'
                  : 'none',
            transition: 'background-color 0.2s, border-color 0.2s',
          }}
          animate={{
            height: dragState
              ? TRAY_HEIGHT_EXPANDED
              : removedPhotos.length
                ? TRAY_HEIGHT
                : 0,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        >
          <div className="flex items-center w-full h-full px-6">
            <AnimatePresence mode="wait">
              {dragState ? (
                <motion.p
                  key="drag-hint"
                  className="text-[14px] w-full text-center"
                  style={{
                    color:
                      dragTarget === 'tray'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-muted)',
                    fontWeight: dragTarget === 'tray' ? 600 : 400,
                    transition: 'color 0.15s',
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {dragTarget === 'tray'
                    ? 'Release to remove from story'
                    : 'Drop here to remove from story'}
                </motion.p>
              ) : removedPhotos.length > 0 ? (
                <motion.div
                  key="removed-list"
                  className="flex items-center gap-3 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span
                    className="text-[13px] uppercase tracking-widest shrink-0"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Removed ({removedPhotos.length})
                  </span>
                  <div className="flex gap-2 overflow-x-auto">
                    {removedPhotos.map((photo) => (
                      <motion.div
                        key={photo.id}
                        className="w-8 h-8 rounded shrink-0 overflow-hidden"
                        style={{
                          border: '1px solid var(--color-border)',
                          opacity: 0.6,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────── */}
      <Lightbox
        photo={lightboxPhoto}
        story={{ ...story, title: editableTitle }}
        photos={editablePhotos}
        onClose={() => setLightboxPhoto(null)}
        onNavigate={handleLightboxNavigate}
        onRemove={handleRemoveFromLightbox}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </motion.div>
  )
}
