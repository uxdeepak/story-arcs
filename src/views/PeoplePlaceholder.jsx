import { allPeople } from '../data/demoData.js'

const PERSON_COLORS = {
  Maya: '#C4724E',
  Jon: '#6B8A7A',
  Alex: '#D4A03E',
}

export default function PeoplePlaceholder() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6" style={{ backgroundColor: 'var(--color-bg)' }}>
      <h1
        className="text-3xl font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
      >
        People
      </h1>
      <div className="flex gap-4">
        {allPeople.map((name) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
              style={{
                backgroundColor: PERSON_COLORS[name] || 'var(--color-text-muted)',
                color: 'var(--color-bg)',
              }}
            >
              {name[0]}
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{name}</span>
          </div>
        ))}
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Coming soon</p>
    </div>
  )
}
