const modules = [
  {
    id: 'MOD-01',
    name: 'Weapon detection',
    desc: 'Flags firearms and edged weapons in frame, even partially occluded or in low light.',
  },
  {
    id: 'MOD-02',
    name: 'Crowd anomaly',
    desc: 'Learns normal foot traffic per site and alerts on sudden surges, stampedes, or dispersal.',
  },
  {
    id: 'MOD-03',
    name: 'Perimeter breach',
    desc: 'Watches fence lines and restricted zones after hours, ignoring wildlife and debris.',
  },
  {
    id: 'MOD-04',
    name: 'Plate recognition',
    desc: 'Reads plates against a watchlist you control and alerts within one frame of a match.',
  },
  {
    id: 'MOD-05',
    name: 'Loitering pattern',
    desc: 'Distinguishes someone waiting for a ride from someone casing an entrance.',
  },
  {
    id: 'MOD-06',
    name: 'Fall & assault',
    desc: 'Recognizes physical altercations and collapse events for faster medical response.',
  },
]

export default function Modules() {
  return (
    <section id="modules" className="border-b border-base-line bg-base-panel/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="max-w-xl">
          <span className="eyebrow">Detection modules</span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Six trained eyes, one feed.
          </h2>
          <p className="mt-4 text-ink-muted">
            Every module runs on the same camera stream in parallel — turn on
            what your site needs, leave the rest off.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-md border border-base-line bg-base-line sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.id}
              className="corner-frame group relative bg-base-panel p-7 transition-colors hover:bg-base-raised"
            >
              <span className="cf-tr" />
              <span className="cf-br" />
              <span className="font-mono text-[11px] tracking-[0.14em] text-amber-dim group-hover:text-amber">
                {m.id}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">{m.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
