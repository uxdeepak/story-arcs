import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('story-arcs-theme')
      if (stored === 'light' || stored === 'dark') return stored
    } catch {}
    // Respect system preference
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
    return 'dark'
  })

  useEffect(() => {
    try { localStorage.setItem('story-arcs-theme', theme) } catch {}
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    // Temporarily enable transitions on all elements during theme switch
    document.documentElement.classList.add('theme-switching')
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
    setTimeout(() => document.documentElement.classList.remove('theme-switching'), 500)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
