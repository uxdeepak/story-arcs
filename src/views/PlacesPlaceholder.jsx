export default function PlacesPlaceholder() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <h1
        className="text-3xl font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
      >
        Places
      </h1>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Coming soon</p>
    </div>
  )
}
