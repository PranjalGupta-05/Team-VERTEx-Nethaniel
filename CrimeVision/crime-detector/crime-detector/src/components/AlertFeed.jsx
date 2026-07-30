const alerts = [
  {
    id: 'INC-88291',
    time: '02:41:07',
    module: 'PERIMETER BREACH',
    site: 'Riverside Depot — Gate 3',
    confidence: 96,
    severity: 'high',
  },
  {
    id: 'INC-88290',
    time: '02:38:52',
    module: 'LOITERING PATTERN',
    site: 'Metro Plaza — East Entrance',
    confidence: 82,
    severity: 'medium',
  },
  {
    id: 'INC-88289',
    time: '02:31:14',
    module: 'CROWD ANOMALY',
    site: 'Union Terminal — Platform 2',
    confidence: 91,
    severity: 'high',
  },
  {
    id: 'INC-88287',
    time: '02:19:40',
    module: 'PLATE RECOGNITION',
    site: 'Harbor Lot B',
    confidence: 99,
    severity: 'medium',
  },
]

const severityStyles = {
  high: 'text-alert border-alert/40 bg-alert/10',
  medium: 'text-amber border-amber/40 bg-amber/10',
}

export default function AlertFeed() {
  return (
    <section id="feed" className="border-b border-base-line bg-base-panel/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Operator view</span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              What lands in the queue.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink-muted">
            Every alert carries the clip, location, and confidence score —
            operators triage in seconds, not minutes.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-md border border-base-line">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-base-line bg-base-raised px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim sm:grid-cols-[90px_1fr_1fr_90px]">
            <span>Time</span>
            <span>Module</span>
            <span className="hidden sm:block">Site</span>
            <span className="text-right">Match</span>
          </div>

          {alerts.map((a, i) => (
            <div
              key={a.id}
              className="grid animate-rise grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-base-line bg-base-panel px-5 py-4 opacity-0 last:border-b-0 sm:grid-cols-[90px_1fr_1fr_90px]"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="font-mono text-xs text-ink-dim">{a.time}</span>
              <span
                className={`w-fit rounded-sm border px-2 py-0.5 font-mono text-[11px] tracking-wide ${severityStyles[a.severity]}`}
              >
                {a.module}
              </span>
              <span className="hidden truncate text-sm text-ink-muted sm:block">{a.site}</span>
              <span className="text-right font-mono text-xs text-ink">{a.confidence}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
