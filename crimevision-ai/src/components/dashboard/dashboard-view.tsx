"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, ArrowRight, DatabaseZap, Fingerprint, FolderKanban, ScanLine } from "lucide-react";
import Link from "next/link";
import { useApi } from "@/lib/api-provider";
import { demoDashboard } from "@/lib/demo-data";
import type { DashboardSummary } from "@/lib/types";
import { CaseCard } from "./case-card";
import { MetricCard } from "./metric-card";
import { CreateCaseDialog } from "./create-case-dialog";

export function DashboardView() {
  const { request } = useApi();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [source, setSource] = useState<"live" | "demo">("live");

  const load = useCallback(async () => {
    try {
      const result = await request<{ data: DashboardSummary }>("/dashboard/summary");
      setData(result.data);
      setSource("live");
    } catch {
      if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false") {
        setData(demoDashboard);
        setSource("demo");
      }
    }
  }, [request]);

  useEffect(() => void load(), [load]);

  if (!data) {
    return (
      <section className="py-8">
        <div className="skeleton h-8 w-72 rounded-lg" />
        <div className="mt-8 grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <div key={item} className="skeleton h-36 rounded-[18px]" />)}
        </div>
      </section>
    );
  }

  return (
    <div className="py-7">
      <section className="flex items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Operations overview</p>
            {source === "demo" && <span className="mono rounded border border-amber-300/20 bg-amber-300/5 px-1.5 py-0.5 text-[8px] text-amber-200">DEMO DATA</span>}
          </div>
          <h1 className="mt-2 text-[29px] font-semibold tracking-[-0.04em] text-white">Investigative command</h1>
          <p className="mt-1 text-[11px] text-[#74817f]">Evidence integrity, AI throughput, and active case posture.</p>
        </div>
        <CreateCaseDialog onCreated={() => void load()} />
      </section>

      <section className="mt-7 grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[680px]:grid-cols-1">
        <MetricCard label="Active cases" value={String(data.metrics.activeCases).padStart(2, "0")} detail="+3 this month" icon={FolderKanban} trend={[5, 6, 5, 8, 9, 8, 11]} />
        <MetricCard label="Evidence indexed" value={data.metrics.evidenceItems.toLocaleString()} detail="Across all workspaces" icon={DatabaseZap} trend={[3, 5, 7, 9, 8, 12, 15]} accent="acid" />
        <MetricCard label="Analysis queue" value={String(data.metrics.pendingAnalysis).padStart(2, "0")} detail="Median wait 01:42" icon={ScanLine} trend={[10, 8, 13, 7, 9, 5, 4]} accent="amber" />
        <MetricCard label="Integrity coverage" value={`${data.metrics.integrityCoverage}%`} detail="SHA-256 verified" icon={Fingerprint} trend={[14, 14, 15, 15, 15, 15, 16]} accent="acid" />
      </section>

      <section className="mt-8 grid grid-cols-[minmax(0,1fr)_310px] gap-5 max-[1100px]:grid-cols-1">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">Priority workspaces</p>
              <h2 className="mt-1 text-[16px] font-semibold">Recent case activity</h2>
            </div>
            <Link href="/cases" className="flex items-center gap-1 text-[10px] font-semibold text-[#8a9996] no-underline transition hover:text-cyan">
              VIEW ALL <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 max-[820px]:grid-cols-1">
            {data.recentCases.slice(0, 4).map((item) => <CaseCard key={item.id} caseItem={item} />)}
          </div>
        </div>

        <aside className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
            <div>
              <p className="eyebrow">System pulse</p>
              <h2 className="mt-1 text-[14px] font-semibold">Analysis activity</h2>
            </div>
            <Activity size={15} className="text-cyan" />
          </div>
          <div className="p-4">
            <div className="relative flex h-[94px] items-end gap-1.5 border-b border-white/[0.07]">
              {[35, 48, 41, 63, 55, 76, 58, 88, 72, 91, 67, 82, 62, 94, 74, 86].map((height, index) => (
                <span key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan/10 to-cyan/70" style={{ height: `${height}%`, opacity: 0.38 + index * 0.025 }} />
              ))}
            </div>
            <div className="mono mt-2 flex justify-between text-[7px] text-[#56625f]">
              <span>00:00</span><span>12:00</span><span>NOW</span>
            </div>
          </div>
          <div className="space-y-0 border-t border-white/[0.07]">
            {[
              ["RECONSTRUCTION", "Riverside scene alignment", "1m ago", "acid"],
              ["OCR", "14 text regions indexed", "6m ago", "cyan"],
              ["INTEGRITY", "Batch CV-039104 verified", "13m ago", "acid"],
              ["DETECTION", "Track P-07 correlation", "21m ago", "amber"]
            ].map(([type, text, time, color]) => (
              <div key={text} className="flex gap-3 border-b border-white/[0.05] px-4 py-3 last:border-0">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-${color}`} style={{ background: color === "acid" ? "#c5f66f" : color === "amber" ? "#f4c66a" : "#54e7da" }} />
                <div className="min-w-0">
                  <span className="mono block text-[7px] tracking-[0.12em] text-[#5f6b69]">{type}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#b6c2bf]">{text}</span>
                </div>
                <span className="mono ml-auto shrink-0 text-[7px] text-[#505c5a]">{time}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
