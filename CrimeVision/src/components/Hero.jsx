import { useEffect, useState } from 'react'

const detections = [
  { id: 'DET-2291', label: 'PERSON', confidence: 97, top: '58%', left: '12%', w: 70, h: 130, delay: '0.4s' },
  { id: 'DET-2292', label: 'VEHICLE', confidence: 94, top: '40%', left: '58%', w: 150, h: 90, delay: '1.1s' },
  { id: 'DET-2293', label: 'BAG · UNATTENDED', confidence: 89, top: '68%', left: '38%', w: 60, h: 50, delay: '1.9s' },
]

function useClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function Hero() {
  const time = useClock()
  const stamp = time.toISOString().slice(0, 19).replace('T', ' ')

  return (
    <section id="top" className="relative overflow-hidden border-b border-base-line">
      <div className="absolute inset-0 bg-grid bg-[length:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 md:grid-cols-2 md:items-center md:px-10 md:py-28">
        <div>
          <div className="mb-6 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-amber" />
            <span className="eyebrow">Live incident detection</span>
          </div>

          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            It sees the moment it happens —
            <span className="text-amber"> not the report filed after.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-muted">
            SentryVision watches existing camera feeds and flags weapons, crowd
            surges, perimeter breaches, and unattended objects in under a
            second — then routes the alert to whoever's closest, with the
            clip already attached.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#cta"
              className="rounded-sm bg-amber px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-base transition-transform hover:-translate-y-0.5"
            >
              Request a briefing
            </a>
            <a
              href="#pipeline"
              className="rounded-sm border border-base-line px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-muted transition-colors hover:border-amber/50 hover:text-ink"
            >
              See how it works
            </a>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-base-line pt-6">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">Median alert</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-ink">0.8s</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">False positives</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-ink">&lt;2%</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">Feeds monitored</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-ink">40k+</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-base-line bg-base-panel shadow-[0_0_60px_-15px_rgba(255,176,32,0.15)]">
            {/* scene */}
            <div className="absolute inset-0 opacity-70">
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-base-raised to-transparent" />
              <div className="absolute bottom-0 left-[10%] h-[45%] w-[14%] bg-base-raised" />
              <div className="absolute bottom-0 left-[28%] h-[65%] w-[10%] bg-base-raised" />
              <div className="absolute bottom-0 left-[55%] h-[38%] w-[22%] bg-base-raised" />
              <div className="absolute bottom-0 left-[80%] h-[55%] w-[12%] bg-base-raised" />
            </div>

            {/* scanning sweep */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
              <div className="h-24 w-full animate-scan bg-gradient-to-b from-transparent via-amber/10 to-transparent" />
            </div>

            {/* bounding boxes */}
            {detections.map((d) => (
              <div
                key={d.id}
                className="absolute animate-fadein opacity-0"
                style={{ top: d.top, left: d.left, width: d.w, height: d.h, animationDelay: d.delay }}
              >
                <div className="corner-frame h-full w-full">
                  <span className="cf-tr" />
                  <span className="cf-br" />
                  <div className="absolute inset-0 border border-amber/40" />
                  <div className="absolute -top-6 left-0 whitespace-nowrap rounded-sm bg-amber px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-base">
                    {d.label} · {d.confidence}%
                  </div>
                </div>
              </div>
            ))}

            {/* HUD overlay */}
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-sm bg-base/70 px-2 py-1 font-mono text-[10px] text-alert">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-alert" />
              REC
            </div>
            <div className="absolute right-3 top-3 rounded-sm bg-base/70 px-2 py-1 font-mono text-[10px] text-ink-muted">
              CAM-014 · SECTOR 7
            </div>
            <div className="absolute bottom-3 left-3 rounded-sm bg-base/70 px-2 py-1 font-mono text-[10px] text-ink-muted">
              {stamp} UTC
            </div>
          </div>
          <p className="mt-3 text-center font-mono text-[11px] text-ink-dim">
            Simulated feed for illustration — no real footage or identities.
          </p>
        </div>
      </div>
    </section>
  )
}
