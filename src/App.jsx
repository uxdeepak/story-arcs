import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
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

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)

  const handleSearchOpen = useCallback(() => setSearchOpen(true), [])
  const handleSearchClose = useCallback(() => setSearchOpen(false), [])

  return (
    <>
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
