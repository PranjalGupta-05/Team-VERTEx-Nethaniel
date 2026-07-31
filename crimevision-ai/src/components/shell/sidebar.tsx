"use client";

import {
  Boxes,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CircleHelp,
  DatabaseZap,
  FileClock,
  FileText,
  Settings,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/", label: "Command", icon: ChartNoAxesCombined },
  { href: "/cases", label: "Cases", icon: BriefcaseBusiness },
  { href: "/evidence", label: "Evidence", icon: DatabaseZap },
  { href: "/reconstructions", label: "Reconstructions", icon: Boxes },
  { href: "/audit", label: "Audit trail", icon: FileClock },
  { href: "/reports", label: "Reports", icon: FileText }
];

const secondaryLinks = [
  { href: "/settings", label: "System", icon: Settings },
  { href: "/help", label: "Help", icon: CircleHelp }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-white/[0.08] bg-[#0c1012]/95 px-4 py-5 backdrop-blur-xl max-[680px]:fixed max-[680px]:bottom-0 max-[680px]:top-auto max-[680px]:z-50 max-[680px]:h-[72px] max-[680px]:w-full max-[680px]:flex-row max-[680px]:items-center max-[680px]:border-r-0 max-[680px]:border-t max-[680px]:px-3 max-[680px]:py-2">
      <Link href="/" className="mb-10 flex items-center gap-3 px-2 no-underline max-[680px]:mb-0 max-[680px]:mr-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan/30 bg-cyan/[0.08] text-cyan shadow-[0_0_24px_rgba(84,231,218,.08)]">
          <ShieldCheck size={19} strokeWidth={1.8} />
        </span>
        <span className="leading-none max-[980px]:hidden">
          <strong className="block text-[15px] tracking-[-0.02em] text-white">CRIMEVISION</strong>
          <span className="mono mt-1 block text-[8px] tracking-[0.22em] text-cyan">FORENSIC INTELLIGENCE</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 max-[680px]:flex-row max-[680px]:justify-around">
        {primaryLinks.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium no-underline transition ${
                active
                  ? "bg-white/[0.07] text-white shadow-[inset_2px_0_0_#54e7da]"
                  : "text-[#788684] hover:bg-white/[0.035] hover:text-[#cfdbd9]"
              }`}
            >
              <Icon size={16} strokeWidth={1.7} className={active ? "text-cyan" : "group-hover:text-cyan"} />
              <span className="max-[980px]:hidden">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mb-4 flex flex-col gap-1 max-[680px]:hidden">
        {secondaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium text-[#788684] no-underline transition hover:bg-white/[0.035] hover:text-white"
          >
            <item.icon size={16} strokeWidth={1.7} />
            <span className="max-[980px]:hidden">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 max-[980px]:px-2 max-[680px]:hidden">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-acid" />
          </span>
          <span className="mono text-[8px] font-bold tracking-[0.12em] text-[#c7d1cf] max-[980px]:hidden">
            SYSTEM NOMINAL
          </span>
        </div>
        <div className="mono mt-2 text-[8px] text-[#596563] max-[980px]:hidden">Integrity node · 99.98%</div>
      </div>
    </aside>
  );
}
