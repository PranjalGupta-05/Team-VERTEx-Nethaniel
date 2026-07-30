const points = [
  {
    name: 'On-prem by default',
    desc: 'Video never has to leave your network — inference runs on local hardware.',
  },
  {
    name: 'No facial recognition',
    desc: 'Detection is behavior- and object-based. We deliberately do not identify individuals.',
  },
  {
    name: 'Full audit trail',
    desc: 'Every alert, review, and dismissal is logged and signed for later oversight.',
  },
  {
    name: 'Configurable retention',
    desc: 'Set your own clip retention window to match local policy and law.',
  },
]

export default function Trust() {
  return (
    <section id="trust" className="border-b border-base-line">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <span className="eyebrow">Built with oversight in mind</span>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Detection is only useful if people can trust it.
        </h2>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <div key={p.name} className="border-t border-cyan/30 pt-5">
              <h3 className="font-display text-base font-semibold text-ink">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
