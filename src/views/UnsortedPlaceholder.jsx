import { loosePhotos } from '../data/demoData.js'

export default function UnsortedPlaceholder() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <h1
        className="text-3xl font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
      >
        Unsorted
      </h1>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {loosePhotos.length} loose photos not yet assigned to a story
      </p>
    </div>
  )
}
