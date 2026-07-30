const steps = [
  {
    n: '01',
    name: 'Ingest',
    desc: 'Connects to your existing cameras over RTSP — no new hardware to mount.',
  },
  {
    n: '02',
    name: 'Analyze',
    desc: 'Every frame runs through the active modules on-site, in under 200ms.',
  },
  {
    n: '03',
    name: 'Alert',
    desc: 'A match pages the nearest responder with the clip, location, and confidence score.',
  },
  {
    n: '04',
    name: 'Report',
    desc: 'The incident is logged with a timestamped chain of custody for later review.',
  },
]

export default function Pipeline() {
  return (
    <section id="pipeline" className="border-b border-base-line">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <span className="eyebrow">How it works</span>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          From frame to first responder.
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-amber">{s.n}</span>
                <h3 className="font-display text-xl font-semibold text-ink">{s.name}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="mt-6 hidden h-px w-full bg-gradient-to-r from-base-line to-transparent md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
