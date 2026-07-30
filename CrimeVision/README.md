# SentryVision — Crime Detector Landing Page

React + Vite + Tailwind CSS marketing/landing page for an AI-powered
real-time incident detection product.

## Design concept

- **Palette** — near-black graphite background (`#0A0D12`), amber
  detection accent (`#FFB020`), cyan for trust/compliance content,
  red reserved for high-severity alerts only.
- **Type** — Space Grotesk for headings, Inter for body copy,
  JetBrains Mono for HUD-style data (timestamps, confidence scores,
  module IDs) — mirroring how real detection/surveillance dashboards
  display readouts.
- **Signature element** — the hero panel: an animated mock camera
  feed with scanning sweep, bounding boxes, and a live-ticking
  timestamp, echoing an actual object-detection overlay.
- **Structure** — corner-bracket "viewfinder" framing carries through
  hero, module cards, and CTA to tie the page to its subject.

All imagery is CSS/SVG only — no real photos, footage, or identities.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    Navbar.jsx      Sticky nav
    Hero.jsx         Hero + animated detection panel
    Modules.jsx       Detection module grid
    Pipeline.jsx      Ingest → Analyze → Alert → Report
    AlertFeed.jsx      Live alert queue mockup
    Trust.jsx          Privacy / oversight commitments
    CTA.jsx            Email capture
    Footer.jsx
  App.jsx
  main.jsx
  index.css           Tailwind directives + custom utilities
tailwind.config.js     Color tokens, fonts, keyframes
```

## Notes

- All content (stats, alerts, module list) is placeholder copy —
  swap in real figures before shipping.
- Respects `prefers-reduced-motion`.
- No backend — the CTA form and email input are UI only.
