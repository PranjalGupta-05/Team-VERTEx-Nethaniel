export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-sm border border-amber/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          </span>
          <span className="font-display text-sm font-semibold text-ink">
            Sentry<span className="text-amber">Vision</span>
          </span>
        </div>
        <p className="font-mono text-[11px] text-ink-dim">
          © {new Date().getFullYear()} SentryVision. Demo product — no live deployments referenced.
        </p>
      </div>
    </footer>
  )
}
