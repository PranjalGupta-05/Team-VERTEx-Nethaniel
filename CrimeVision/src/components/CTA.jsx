export default function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden border-b border-base-line">
      <div className="absolute inset-0 bg-grid bg-[length:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-60" />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center md:px-10">
        <span className="eyebrow">Get started</span>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          See it running on your own feed.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink-muted">
          Send over one camera stream and we'll show you real detections
          within a week — no procurement, no commitment.
        </p>

        <form
          className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder="you@agency.gov"
            className="w-full rounded-sm border border-base-line bg-base-panel px-4 py-3 text-sm text-ink placeholder:text-ink-dim focus:border-amber/50"
          />
          <button
            type="submit"
            className="shrink-0 rounded-sm bg-amber px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-base transition-transform hover:-translate-y-0.5"
          >
            Request briefing
          </button>
        </form>
        <p className="mt-4 font-mono text-[11px] text-ink-dim">
          We'll reply within one business day.
        </p>
      </div>
    </section>
  )
}
