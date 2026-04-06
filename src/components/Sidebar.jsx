import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Waves,
  Users,
  MapPin,
  Shuffle,
  Search,
  Settings,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext.jsx'

const NAV_ITEMS = [
  { path: '/', label: 'Timeline', icon: Waves },
  { path: '/people', label: 'People', icon: Users },
  { path: '/places', label: 'Places', icon: MapPin },
  { path: '/unsorted', label: 'Unsorted', icon: Shuffle },
]

const COLLAPSED_W = 64
const EXPANDED_W = 220

export default function Sidebar({ onSearchOpen }) {
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  // Match current route — story views count as Timeline
  function isActive(path) {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/story/')
    }
    return location.pathname === path
  }

  const isDark = theme === 'dark'
  const ThemeIcon = isDark ? Sun : Moon
  const themeLabel = isDark ? 'Light mode' : 'Dark mode'

  return (
    <div
      className="fixed top-0 left-0 h-full z-40 flex flex-col"
      style={{
        width: expanded ? EXPANDED_W : COLLAPSED_W,
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        transition: 'width 300ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo mark */}
      <div
        className="flex items-center h-[52px] px-5 shrink-0 overflow-hidden"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <span
          className="text-base font-semibold whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-accent)',
          }}
        >
          {expanded ? 'Story Arcs' : 'SA'}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 pt-3 px-2">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)
          return (
            <button
              key={path}
              aria-label={label}
              className="relative flex items-center gap-3 h-10 rounded-lg cursor-pointer overflow-hidden"
              style={{
                paddingLeft: 14,
                paddingRight: 14,
                backgroundColor: active ? 'var(--color-accent-subtle)' : 'transparent',
                transition: 'background-color 150ms ease-out, transform 150ms ease-out',
              }}
              onMouseOver={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseOut={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              onClick={() => navigate(path)}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                style={{
                  color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  flexShrink: 0,
                  transition: 'color 200ms ease',
                }}
              />
              <span
                className="text-[13px] whitespace-nowrap"
                style={{
                  color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  opacity: expanded ? 1 : 0,
                  transition: 'opacity 200ms ease',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 pb-4 px-2">
        {/* Theme toggle */}
        <button
          className="flex items-center gap-3 h-10 rounded-lg cursor-pointer overflow-hidden"
          aria-label={`Switch to ${themeLabel.toLowerCase()}`}
          style={{ paddingLeft: 14, paddingRight: 14, transition: 'background-color 150ms ease-out, transform 150ms ease-out' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)'; e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
          onClick={toggleTheme}
        >
          <div className="relative" style={{ width: 18, height: 18, flexShrink: 0 }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <ThemeIcon
                  size={18}
                  strokeWidth={1.8}
                  style={{ color: 'var(--color-text-secondary)' }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <span
            className="text-[13px] whitespace-nowrap"
            style={{
              color: 'var(--color-text-secondary)',
              opacity: expanded ? 1 : 0,
              transition: 'opacity 200ms ease',
            }}
          >
            {themeLabel}
          </span>
        </button>

        {/* Search */}
        <button
          className="flex items-center gap-3 h-10 rounded-lg cursor-pointer overflow-hidden"
          aria-label="Search"
          style={{ paddingLeft: 14, paddingRight: 14, transition: 'background-color 150ms ease-out, transform 150ms ease-out' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)'; e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
          onClick={() => onSearchOpen?.()}
        >
          <Search
            size={18}
            strokeWidth={1.8}
            style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}
          />
          <span
            className="text-[13px] whitespace-nowrap"
            style={{
              color: 'var(--color-text-secondary)',
              opacity: expanded ? 1 : 0,
              transition: 'opacity 200ms ease',
            }}
          >
            Search
          </span>
        </button>

        {/* Settings */}
        <button
          className="flex items-center gap-3 h-10 rounded-lg cursor-pointer overflow-hidden"
          aria-label="Settings"
          style={{ paddingLeft: 14, paddingRight: 14, transition: 'background-color 150ms ease-out, transform 150ms ease-out' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)'; e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          <Settings
            size={18}
            strokeWidth={1.8}
            style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}
          />
          <span
            className="text-[13px] whitespace-nowrap"
            style={{
              color: 'var(--color-text-secondary)',
              opacity: expanded ? 1 : 0,
              transition: 'opacity 200ms ease',
            }}
          >
            Settings
          </span>
        </button>
      </div>
    </div>
  )
}
