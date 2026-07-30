"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useApi } from "@/lib/api-provider";
import { demoDashboard } from "@/lib/demo-data";
import type { CaseSummary } from "@/lib/types";
import { CaseCard } from "@/components/dashboard/case-card";

export function CasesIndex() {
  const { request } = useApi();
  const [cases, setCases] = useState<CaseSummary[]>(demoDashboard.recentCases);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void request<{ data: CaseSummary[] }>("/cases")
      .then((result) => setCases(result.data))
      .catch(() => undefined);
  }, [request]);

  const filtered = cases.filter((item) => `${item.reference} ${item.title} ${item.location}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="py-7">
      <p className="eyebrow">Case registry</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[29px] font-semibold tracking-[-0.04em]">Investigative workspaces</h1>
          <p className="mt-1 text-[11px] text-[#74817f]">Controlled access to active and archived case material.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-3 py-2.5 text-[9px] font-semibold text-[#9ba8a5]"><SlidersHorizontal size={12} /> FILTERS</button>
      </div>
      <div className="surface mt-6 flex items-center gap-2 px-3 py-2.5">
        <Search size={14} className="text-[#687572]" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by reference, title, or location…" className="w-full bg-transparent text-[11px] text-white outline-none placeholder:text-[#53605d]" />
        <span className="mono text-[8px] text-[#596563]">{filtered.length} MATCHES</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1">
        {filtered.map((item) => <CaseCard key={item.id} caseItem={item} />)}
      </div>
    </div>
  );
}
