import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar.jsx'
import SearchOverlay from './components/SearchOverlay.jsx'

const RiverTimeline = lazy(() => import('./views/RiverTimeline.jsx'))
const StoryView = lazy(() => import('./views/StoryView.jsx'))
const PeoplePlaceholder = lazy(() => import('./views/PeoplePlaceholder.jsx'))
const PlacesPlaceholder = lazy(() => import('./views/PlacesPlaceholder.jsx'))
const UnsortedPlaceholder = lazy(() => import('./views/UnsortedPlaceholder.jsx'))

const SIDEBAR_WIDTH = 64 // collapsed width in px

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

function LoadingShimmer() {
  return (
    <div
      className="h-screen flex flex-col gap-4 p-8"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="shimmer-block" style={{ width: 240, height: 32 }} />
      <div className="shimmer-block" style={{ width: 160, height: 16 }} />
      <div className="shimmer-block flex-1" style={{ marginTop: 16 }} />
    </div>
  )
}

/* ─── Splash screen ────────────────────────────────────────────────────── */
function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0) // 0 = arcs draw, 1 = text in, 2 = exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900)   // text appears
    const t2 = setTimeout(() => setPhase(2), 2200)   // start exit
    const t3 = setTimeout(() => onDone(), 2900)       // unmount
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  // Shared arc props
  const arcStyle = {
    fill: 'none',
    stroke: 'var(--color-accent)',
    strokeLinecap: 'round',
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
      animate={phase >= 2 ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Subtle radial glow behind arcs */}
      <div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%)',
          opacity: phase >= 1 ? 0.6 : 0,
          transition: 'opacity 800ms ease',
        }}
      />

      {/* SVG arcs that draw themselves */}
      <svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="none"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Outer arc */}
        <path
          d="M10 68 Q60 -10 110 68"
          {...arcStyle}
          strokeWidth="3.5"
          strokeDasharray="180"
          strokeDashoffset="180"
          style={{
            animation: 'splash-draw 1s cubic-bezier(0.65,0,0.35,1) 0.15s forwards',
          }}
        />
        {/* Middle arc */}
        <path
          d="M28 68 Q60 12 92 68"
          {...arcStyle}
          strokeWidth="3.5"
          opacity="0.65"
          strokeDasharray="120"
          strokeDashoffset="120"
          style={{
            animation: 'splash-draw 0.9s cubic-bezier(0.65,0,0.35,1) 0.35s forwards',
          }}
        />
        {/* Inner arc */}
        <path
          d="M44 68 Q60 30 76 68"
          {...arcStyle}
          strokeWidth="3"
          opacity="0.4"
          strokeDasharray="60"
          strokeDashoffset="60"
          style={{
            animation: 'splash-draw 0.8s cubic-bezier(0.65,0,0.35,1) 0.55s forwards',
          }}
        />
        {/* Center dot */}
        <circle
          cx="60"
          cy="68"
          r="4"
          fill="var(--color-accent)"
          style={{
            opacity: 0,
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: 'splash-dot 0.5s ease 0.7s forwards',
          }}
        />
      </svg>

      {/* Title text */}
      <motion.h1
        className="mt-6 text-[32px] font-bold tracking-[-1px]"
        style={{
          fontFamily: 'var(--font-serif)',
          color: 'var(--color-text-primary)',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        Story Arcs
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mt-2 text-[14px]"
        style={{ color: 'var(--color-text-muted)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        Your year, told in photos
      </motion.p>

      {/* Animated river line at the bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        height="3"
        viewBox="0 0 1200 3"
        preserveAspectRatio="none"
        style={{ opacity: phase >= 1 ? 1 : 0, transition: 'opacity 400ms ease' }}
      >
        <line
          x1="0" y1="1.5" x2="1200" y2="1.5"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeDasharray="1200"
          strokeDashoffset="1200"
          style={{
            animation: phase >= 1
              ? 'splash-river 1.2s cubic-bezier(0.22,1,0.36,1) forwards'
              : 'none',
          }}
        />
      </svg>
    </motion.div>
  )
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash once per session
    if (sessionStorage.getItem('sa-splash-shown')) return false
    sessionStorage.setItem('sa-splash-shown', '1')
    return true
  })

  const handleSearchOpen = useCallback(() => setSearchOpen(true), [])
  const handleSearchClose = useCallback(() => setSearchOpen(false), [])
  const handleSplashDone = useCallback(() => setShowSplash(false), [])

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={handleSplashDone} />}
      </AnimatePresence>

      <Sidebar onSearchOpen={handleSearchOpen} />
      <ScrollToTop />

      <div style={{ marginLeft: SIDEBAR_WIDTH }}>
        <Suspense fallback={<LoadingShimmer />}>
          <Routes>
            <Route path="/" element={<RiverTimeline />} />
            <Route path="/story/:id" element={<StoryView />} />
            <Route path="/people" element={<PeoplePlaceholder />} />
            <Route path="/places" element={<PlacesPlaceholder />} />
            <Route path="/unsorted" element={<UnsortedPlaceholder />} />
          </Routes>
        </Suspense>
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={handleSearchClose} />
    </>
  )
}
