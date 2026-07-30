"use client";

import { Bell, ChevronDown, Command, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-[78px] items-center justify-between border-b border-white/[0.07]">
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[#71807e] focus-within:border-cyan/30 max-[680px]:hidden">
        <Search size={15} />
        <input
          aria-label="Search cases and evidence"
          placeholder="Search cases, evidence, entities…"
          className="w-[280px] bg-transparent text-xs text-white outline-none placeholder:text-[#596664]"
        />
        <span className="mono flex items-center gap-1 rounded border border-white/[0.08] px-1.5 py-0.5 text-[8px]">
          <Command size={9} /> K
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="status-pill max-[680px]:hidden">
          <span className="status-dot" />
          SECURE DEMO
        </span>
        <button aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#9aaba8] transition hover:text-white">
          <Bell size={15} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-acid" />
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] py-1.5 pl-1.5 pr-2 text-left">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-cyan to-[#227f81] text-[10px] font-bold text-[#07100f]">AM</span>
          <span className="max-[680px]:hidden">
            <strong className="block text-[10px] font-semibold text-[#edf6f4]">Alex Morgan</strong>
            <span className="mono block text-[8px] text-[#687572]">INVESTIGATOR</span>
          </span>
          <ChevronDown size={12} className="text-[#667371] max-[680px]:hidden" />
        </button>
      </div>
    </header>
  );
}
