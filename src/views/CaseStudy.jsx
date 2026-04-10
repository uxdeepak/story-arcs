import { Link } from 'react-router-dom'
import {
  Waves,
  Users,
  MapPin,
  Image as ImageIcon,
  Search,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────
 * Story Arcs — Bento-grid case study
 * Layout inspired by the Vibe Coding bento template, restyled with the
 * project's existing tokens (serif headings, warm accent, dark surface).
 * ────────────────────────────────────────────────────────────────────── */

const SERIF = { fontFamily: 'var(--font-serif)' }
const SANS = { fontFamily: 'var(--font-sans)' }

function Card({ children, style, className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Eyebrow({ children, color = 'var(--color-accent)' }) {
  return (
    <p
      className="text-[10px] font-medium tracking-[2.5px] uppercase"
      style={{ color, ...SANS }}
    >
      {children}
    </p>
  )
}

function Pill({ children }) {
  return (
    <span
      className="inline-flex items-center px-3 h-6 rounded-full text-[11px] font-medium"
      style={{
        backgroundColor: 'var(--color-accent-subtle)',
        color: 'var(--color-accent)',
        ...SANS,
      }}
    >
      {children}
    </span>
  )
}

const FEATURES = [
  { icon: Waves, label: 'River Timeline' },
  { icon: Sparkles, label: 'Story Islands' },
  { icon: Users, label: 'People Index' },
  { icon: MapPin, label: 'Place Rollups' },
  { icon: ImageIcon, label: 'Smart Clusters' },
  { icon: Search, label: 'Universal Search' },
]

const PROCESS = [
  'Information architecture',
  'River timeline & zoom levels',
  'Cluster + thread system',
  'Accessibility & polish',
]

export default function CaseStudy() {
  return (
    <div
      className="min-h-screen w-full px-10 py-10"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="mx-auto grid gap-5"
        style={{
          maxWidth: 1360,
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridAutoRows: 'minmax(0, auto)',
        }}
      >
        {/* ─── Title ─────────────────────────────────────────────── */}
        <Card className="col-span-4 p-6" style={{ minHeight: 280 }}>
          <div
            className="absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              right: -60,
              top: -60,
              background:
                'radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%)',
            }}
          />
          <div
            className="flex items-center justify-center rounded-xl mb-4"
            style={{
              width: 44,
              height: 44,
              backgroundColor: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-thread-line)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 18 Q12 4 21 18"
                stroke="var(--color-accent)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M6 18 Q12 9 18 18"
                stroke="var(--color-accent)"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.65"
              />
              <circle cx="12" cy="18" r="1.6" fill="var(--color-accent)" />
            </svg>
          </div>
          <h1
            className="text-[40px] leading-[1] font-bold tracking-[-1px]"
            style={{ ...SERIF, color: 'var(--color-text-primary)' }}
          >
            Story Arcs
          </h1>
          <p
            className="text-[20px] mt-1 mb-4 tracking-[-0.5px]"
            style={{ ...SERIF, color: 'var(--color-accent)' }}
          >
            Your year, told in photos.
          </p>
          <p
            className="text-[13px] leading-[20px] mb-5"
            style={{ color: 'var(--color-text-muted)', ...SANS }}
          >
            A photo timeline that turns thousands of camera-roll images into
            browsable narrative arcs.
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill>Web App</Pill>
            <Pill>2026</Pill>
            <Pill>Claude Code</Pill>
          </div>
        </Card>

        {/* ─── Problem ───────────────────────────────────────────── */}
        <Card className="col-span-3 p-6" style={{ minHeight: 280 }}>
          <Eyebrow>The Problem</Eyebrow>
          <div className="flex gap-3 mt-5">
            <div
              className="rounded-sm shrink-0"
              style={{
                width: 3,
                backgroundColor: 'var(--color-accent)',
              }}
            />
            <h2
              className="text-[20px] leading-[26px] font-bold tracking-[-0.3px]"
              style={{ ...SERIF, color: 'var(--color-text-primary)' }}
            >
              Camera rolls are graveyards. Memories deserve a story.
            </h2>
          </div>
          <p
            className="text-[12px] leading-[18px] mt-5"
            style={{ color: 'var(--color-text-muted)', ...SANS }}
          >
            Phones capture 1,000+ photos a year, but apps surface them as an
            endless grid — flat, undated, unmemorable.
          </p>
        </Card>

        {/* ─── Demo / Preview ───────────────────────────────────── */}
        <Card
          className="col-span-5 p-5"
          style={{
            minHeight: 280,
            backgroundColor: 'var(--color-surface-elevated)',
          }}
        >
          <div
            className="relative w-full h-[220px] rounded-[14px] overflow-hidden"
            style={{
              background:
                'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Faux river */}
            <div
              className="absolute left-0 right-0"
              style={{
                top: '50%',
                height: 1,
                background:
                  'linear-gradient(90deg, transparent, var(--color-thread-line) 15%, var(--color-thread-line) 85%, transparent)',
              }}
            />
            {/* Faux story islands */}
            {[
              { left: '10%', top: 28, w: 70, h: 50, accent: true },
              { left: '28%', top: 100, w: 60, h: 44 },
              { left: '44%', top: 22, w: 80, h: 58, accent: true },
              { left: '64%', top: 110, w: 56, h: 42 },
              { left: '78%', top: 32, w: 72, h: 52 },
            ].map((s, i) => (
              <div
                key={i}
                className="absolute rounded-md"
                style={{
                  left: s.left,
                  top: s.top,
                  width: s.w,
                  height: s.h,
                  backgroundColor: s.accent
                    ? 'var(--color-accent-subtle)'
                    : 'var(--color-surface-elevated)',
                  border: `1px solid ${
                    s.accent ? 'var(--color-accent)' : 'var(--color-border)'
                  }`,
                }}
              />
            ))}
            {/* Month labels */}
            <div
              className="absolute left-0 right-0 flex justify-between px-4 text-[9px]"
              style={{
                bottom: 8,
                color: 'var(--color-text-muted)',
                ...SANS,
              }}
            >
              {['Jan', 'Apr', 'Jul', 'Oct', 'Dec'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
            <p
              className="text-[11px]"
              style={{ color: 'var(--color-text-muted)', ...SANS }}
            >
              Live demo — try the river
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[11px] font-medium"
              style={{ color: 'var(--color-accent)', ...SANS }}
            >
              Open <ArrowRight size={12} />
            </Link>
          </div>
        </Card>

        {/* ─── Audience ─────────────────────────────────────────── */}
        <Card className="col-span-4 p-6" style={{ minHeight: 250 }}>
          <Eyebrow>For</Eyebrow>
          {[
            {
              icon: '📸',
              title: 'The Memory Keeper',
              meta: 'Wants every trip to mean something',
            },
            {
              icon: '🧭',
              title: 'The Storyteller',
              meta: 'Curates albums for friends & family',
            },
            {
              icon: '🗂️',
              title: 'The Organizer',
              meta: 'Drowning in 10k+ unsorted photos',
            },
          ].map((a) => (
            <div key={a.title} className="flex items-center gap-3 mt-4">
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: 'var(--color-accent-subtle)',
                  fontSize: 20,
                }}
              >
                {a.icon}
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: 'var(--color-text-primary)', ...SANS }}
                >
                  {a.title}
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: 'var(--color-text-muted)', ...SANS }}
                >
                  {a.meta}
                </p>
              </div>
            </div>
          ))}
        </Card>

        {/* ─── Built with Claude ────────────────────────────────── */}
        <Card
          className="col-span-3 p-6"
          style={{
            minHeight: 526,
            background:
              'linear-gradient(180deg, var(--color-surface) 0%, rgba(196,114,78,0.08) 100%)',
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              right: -50,
              top: -40,
              background:
                'radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%)',
            }}
          />
          <Eyebrow>Built With</Eyebrow>
          <div
            className="flex items-center justify-center rounded-full mt-5 mb-4"
            style={{
              width: 48,
              height: 48,
              backgroundColor: 'var(--color-accent)',
            }}
          >
            <Sparkles size={22} color="var(--color-bg)" />
          </div>
          <h3
            className="text-[24px] font-bold tracking-[-0.5px]"
            style={{ ...SERIF, color: 'var(--color-accent)' }}
          >
            Claude Code
          </h3>
          <p
            className="text-[12px] leading-[19px] mt-2 mb-6"
            style={{ color: 'var(--color-text-muted)', ...SANS }}
          >
            A collaborative partner from day one — pairing on architecture,
            interaction details, and accessibility passes.
          </p>
          {PROCESS.map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-[10px] px-3 mb-2"
              style={{
                height: 42,
                backgroundColor: 'var(--color-surface-elevated)',
              }}
            >
              <span
                className="text-[10px] font-bold"
                style={{ color: 'var(--color-accent)', ...SANS }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className="text-[12px] font-medium"
                style={{ color: 'var(--color-text-secondary)', ...SANS }}
              >
                {step}
              </span>
            </div>
          ))}
          <div className="mt-3">
            <Pill>Built in 2 weeks</Pill>
          </div>
        </Card>

        {/* ─── Tech Stack ───────────────────────────────────────── */}
        <Card className="col-span-5 p-6" style={{ minHeight: 250 }}>
          <Eyebrow>Tech Stack</Eyebrow>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-5">
            {[
              ['React + Vite', 'App shell & routing'],
              ['Tailwind v4', 'Utility-first styling'],
              ['Framer Motion', 'Layout transitions'],
              ['d3-force', 'Cluster layouts'],
              ['Lucide Icons', 'Icon system'],
              ['CSS Variables', 'Theme tokens'],
            ].map(([name, desc]) => (
              <div key={name} className="flex items-start gap-2">
                <div
                  className="rounded-full mt-[7px] shrink-0"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: 'var(--color-accent)',
                  }}
                />
                <div>
                  <p
                    className="text-[13px] font-bold"
                    style={{ color: 'var(--color-text-primary)', ...SANS }}
                  >
                    {name}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: 'var(--color-text-muted)', ...SANS }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Stats ────────────────────────────────────────────── */}
        <Card
          className="col-span-4 p-6"
          style={{
            minHeight: 262,
            backgroundColor: 'var(--color-accent)',
            border: 'none',
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              right: -40,
              top: -40,
              background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
            }}
          />
          <p
            className="text-[10px] font-medium tracking-[2.5px] uppercase"
            style={{ color: 'rgba(255,255,255,0.75)', ...SANS }}
          >
            By the Numbers
          </p>
          {[
            ['3', 'Zoom levels'],
            ['5', 'Distinct views'],
            ['12', 'Cluster categories'],
            ['WCAG AA', 'Contrast across themes'],
          ].map(([n, label]) => (
            <div key={label} className="mt-4">
              <p
                className="text-[22px] font-bold leading-none"
                style={{ ...SERIF, color: '#fff' }}
              >
                {n}
              </p>
              <p
                className="text-[11px] mt-1"
                style={{ color: 'rgba(255,255,255,0.75)', ...SANS }}
              >
                {label}
              </p>
            </div>
          ))}
        </Card>

        {/* ─── Key Features ─────────────────────────────────────── */}
        <Card className="col-span-5 p-6" style={{ minHeight: 262 }}>
          <Eyebrow>Key Features</Eyebrow>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center rounded-[12px]"
                style={{
                  height: 84,
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={1.6}
                  color="var(--color-accent)"
                />
                <p
                  className="text-[11px] font-medium mt-2"
                  style={{ color: 'var(--color-text-secondary)', ...SANS }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Style Guide ──────────────────────────────────────── */}
        <Card className="col-span-7 p-6" style={{ minHeight: 220 }}>
          <Eyebrow>Style Guide</Eyebrow>
          <div className="grid grid-cols-2 gap-6 mt-5">
            {/* Colors */}
            <div>
              <p
                className="text-[11px] font-medium mb-3"
                style={{ color: 'var(--color-text-muted)', ...SANS }}
              >
                Palette
              </p>
              <div className="flex gap-2">
                {[
                  ['var(--color-bg)', 'Bg'],
                  ['var(--color-surface)', 'Surface'],
                  ['var(--color-surface-elevated)', 'Elev'],
                  ['var(--color-accent)', 'Accent'],
                  ['var(--color-text-primary)', 'Text'],
                ].map(([c, label]) => (
                  <div key={label} className="flex-1">
                    <div
                      className="h-12 rounded-md"
                      style={{
                        backgroundColor: c,
                        border: '1px solid var(--color-border)',
                      }}
                    />
                    <p
                      className="text-[10px] mt-1 text-center"
                      style={{ color: 'var(--color-text-muted)', ...SANS }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* Type */}
            <div>
              <p
                className="text-[11px] font-medium mb-3"
                style={{ color: 'var(--color-text-muted)', ...SANS }}
              >
                Typography
              </p>
              <p
                className="text-[24px] leading-none tracking-[-0.5px]"
                style={{ ...SERIF, color: 'var(--color-text-primary)' }}
              >
                Playfair Display
              </p>
              <p
                className="text-[10px] mt-1"
                style={{ color: 'var(--color-text-muted)', ...SANS }}
              >
                Serif · Display & headings
              </p>
              <p
                className="text-[16px] mt-3"
                style={{ ...SANS, color: 'var(--color-text-primary)' }}
              >
                DM Sans
              </p>
              <p
                className="text-[10px] mt-1"
                style={{ color: 'var(--color-text-muted)', ...SANS }}
              >
                Sans · UI & body
              </p>
            </div>
          </div>
        </Card>

        {/* ─── Try It / CTA ─────────────────────────────────────── */}
        <Card className="col-span-5 p-6" style={{ minHeight: 220 }}>
          <div
            className="absolute rounded-full"
            style={{
              width: 180,
              height: 180,
              right: -40,
              bottom: -40,
              background:
                'radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%)',
            }}
          />
          <Eyebrow>Try It</Eyebrow>
          <h3
            className="text-[26px] font-bold leading-[32px] mt-3 tracking-[-0.5px]"
            style={{ ...SERIF, color: 'var(--color-text-primary)' }}
          >
            Walk through
            <br />a year of stories.
          </h3>
          <p
            className="text-[12px] leading-[19px] mt-3"
            style={{ color: 'var(--color-text-muted)', ...SANS }}
          >
            Open the timeline and zoom from year-at-a-glance down to the
            individual moments.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-5 px-5 h-11 rounded-full font-bold text-[13px]"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              ...SANS,
            }}
          >
            Enter Story Arcs <ArrowRight size={14} />
          </Link>
          <p
            className="text-[10px] mt-4"
            style={{ color: 'var(--color-text-muted)', ...SANS }}
          >
            Designed & built by Deepak · uxdeepak
          </p>
        </Card>
      </div>
    </div>
  )
}
