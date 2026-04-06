import { Plus, Minus } from 'lucide-react'

/**
 * ZoomControls — floating +/- buttons on the right side of the timeline
 * with a level indicator between them.
 */
export default function ZoomControls({
  zoomLevel,
  totalLevels,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
  levelLabel,
}) {
  return (
    <div
      className="absolute right-4 flex flex-col items-center gap-1"
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
      }}
    >
      {/* Zoom in */}
      <button
        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          color: canZoomIn ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          opacity: canZoomIn ? 1 : 0.4,
          transition: 'opacity 150ms ease, background-color 150ms ease',
          pointerEvents: canZoomIn ? 'auto' : 'none',
        }}
        onClick={onZoomIn}
        aria-label="Zoom in"
        title="Zoom in (Ctrl+scroll)"
        onMouseOver={(e) => {
          if (canZoomIn) e.currentTarget.style.backgroundColor = 'var(--color-surface)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)'
        }}
      >
        <Plus size={16} strokeWidth={2} />
      </button>

      {/* Level indicator */}
      <div
        className="flex flex-col items-center gap-0.5 py-1"
        title={levelLabel}
      >
        {Array.from({ length: totalLevels }).map((_, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 4,
              height: 4,
              backgroundColor:
                i <= zoomLevel ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'background-color 200ms ease',
            }}
          />
        ))}
      </div>

      {/* Zoom out */}
      <button
        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          color: canZoomOut ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          opacity: canZoomOut ? 1 : 0.4,
          transition: 'opacity 150ms ease, background-color 150ms ease',
          pointerEvents: canZoomOut ? 'auto' : 'none',
        }}
        onClick={onZoomOut}
        aria-label="Zoom out"
        title="Zoom out (Ctrl+scroll)"
        onMouseOver={(e) => {
          if (canZoomOut) e.currentTarget.style.backgroundColor = 'var(--color-surface)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)'
        }}
      >
        <Minus size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
