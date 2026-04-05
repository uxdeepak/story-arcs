# Story Arcs

A reimagined photo library that organizes your photos into spatial, explorable narrative arcs on a timeline.

> **Portfolio case study** — frontend-only with hardcoded demo data, designed for desktop (1280px+).

![Screenshot placeholder](docs/screenshot.png)

## Tech Stack

- **React 19** with React Router for navigation
- **Vite** for dev server and production builds
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **d3-force** for spatial photo clustering layouts
- **Framer Motion** for animations and transitions
- **Lucide React** for icons
- **Google Fonts** — Playfair Display (serif headings) + DM Sans (body text)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

To build for production:

```bash
npm run build
npm run preview
```

## Features

- **River Timeline** — horizontal timeline with a mood-colored river line, story islands, density strips, connection threads between related stories, and a minimap for navigation
- **Story View** — spatial photo layout powered by d3-force simulation, with drag-to-rearrange photos between clusters, drag-to-tray removal, and inline editing of titles and cluster names
- **Lightbox** — full-screen photo viewer with crossfade transitions, keyboard navigation, metadata panel, and favorite/remove actions
- **Search Overlay** — search across stories, people, and places
- **Animated page load** — river draw animation, staggered island entrance, sequential month label fade-in
- **Parallax depth** — subtle mouse-tracking parallax on photo nodes
- **Noise texture overlay** — film grain aesthetic at 2.5% opacity
