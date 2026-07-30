export default function Navbar() {
  const links = [
    { label: 'Modules', href: '#modules' },
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Live feed', href: '#feed' },
    { label: 'Trust', href: '#trust' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-base-line/80 bg-base/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rounded-sm border border-amber/50" />
            <span className="h-2 w-2 rounded-full bg-amber shadow-[0_0_8px_rgba(255,176,32,0.8)]" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Sentry<span className="text-amber">Vision</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-amber"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#cta"
          className="rounded-sm border border-amber/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-amber transition-colors hover:bg-amber hover:text-base"
        >
          Request briefing
        </a>
      </nav>
    </header>
  )
}
