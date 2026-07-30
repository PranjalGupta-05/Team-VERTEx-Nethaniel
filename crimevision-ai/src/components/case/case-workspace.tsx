"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Box, Download, Ellipsis, Fingerprint, MapPin, Share2 } from "lucide-react";
import Link from "next/link";
import { useApi } from "@/lib/api-provider";
import { demoCase, demoTimeline } from "@/lib/demo-data";
import type { CaseDetail, TimelineEvent } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChatPanel } from "./chat-panel";
import { EvidenceRail } from "./evidence-rail";
import { EvidenceTimeline } from "./evidence-timeline";
import { SceneViewer } from "./scene-viewer";

export function CaseWorkspace({ caseId }: { caseId: string }) {
  const { request } = useApi();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [source, setSource] = useState<"live" | "demo">("live");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [caseResult, timelineResult] = await Promise.all([
        request<{ data: CaseDetail }>(`/cases/${caseId}`),
        request<{ data: TimelineEvent[] }>(`/analysis/timeline/${caseId}`)
      ]);
      setCaseData(caseResult.data);
      setTimeline(timelineResult.data);
      setSource("live");
    } catch {
      if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false") {
        setCaseData({ ...demoCase, id: caseId });
        setTimeline(demoTimeline);
        setSource("demo");
      }
    }
  }, [caseId, request]);

  useEffect(() => void load(), [load]);

  async function exportManifest() {
    setExporting(true);
    try {
      const manifest = await request<Record<string, unknown>>(`/reports/cases/${caseId}/manifest`, { method: "POST" });
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${caseData?.reference ?? "crimevision"}-manifest.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (!caseData) {
    return <div className="skeleton my-7 h-[720px] rounded-[18px]" />;
  }

  return (
    <div className="py-5">
      <div className="flex items-center gap-2 text-[9px] text-[#677472]">
        <Link href="/" className="flex items-center gap-1 text-[#7f8c89] no-underline hover:text-cyan"><ArrowLeft size={11} /> COMMAND</Link>
        <span>/</span><span>CASES</span><span>/</span><span className="mono text-cyan">{caseData.reference}</span>
        {source === "demo" && <span className="mono ml-2 rounded border border-amber-300/20 bg-amber-300/5 px-1.5 py-0.5 text-[7px] text-amber-200">DEMO</span>}
      </div>

      <section className="mt-4 flex items-end justify-between gap-5 max-[820px]:items-start max-[820px]:flex-col">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[23px] font-semibold tracking-[-0.035em] text-white">{caseData.title}</h1>
            <StatusBadge status={caseData.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[9px] text-[#6f7c79]">
            <span className="flex items-center gap-1"><MapPin size={10} /> {caseData.location}</span>
            <span className="flex items-center gap-1"><Fingerprint size={10} /> {caseData.evidence.length} evidence objects</span>
            <span className="mono">OWNER · {caseData.owner.displayName?.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.025] text-[#85928f] hover:text-white"><Share2 size={14} /></button>
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.025] text-[#85928f] hover:text-white"><Ellipsis size={15} /></button>
          <button onClick={() => void exportManifest()} disabled={exporting} className="flex items-center gap-2 rounded-xl bg-cyan px-4 text-[9px] font-bold text-[#06100f] disabled:opacity-50">
            <Download size={13} /> {exporting ? "CERTIFYING…" : "EXPORT MANIFEST"}
          </button>
        </div>
      </section>

      <nav className="mt-6 flex gap-6 border-b border-white/[0.07]">
        {["Digital twin", "Evidence", "Detections", "Entities", "Chain of custody"].map((tab, index) => (
          <button key={tab} className={`relative pb-3 text-[9px] font-semibold uppercase tracking-[0.08em] ${index === 0 ? "text-white after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-cyan" : "text-[#64716f] hover:text-[#aeb9b7]"}`}>
            {tab}
          </button>
        ))}
      </nav>

      <section className="surface mt-4 grid min-h-[500px] grid-cols-[210px_minmax(0,1fr)_300px] overflow-hidden max-[1200px]:grid-cols-[190px_minmax(0,1fr)] max-[1200px]:[&>*:last-child]:hidden max-[820px]:grid-cols-1 max-[820px]:[&>*:first-child]:hidden">
        <EvidenceRail caseId={caseId} evidence={caseData.evidence} onUploaded={() => void load()} />
        <div className="relative p-2">
          <SceneViewer />
          <div className="pointer-events-none absolute bottom-5 left-5 flex items-center gap-2 rounded-lg bg-[#0b1112]/80 px-2 py-1 backdrop-blur">
            <Box size={10} className="text-cyan" />
            <span className="mono text-[7px] text-[#7c8a87]">GAUSSIAN SPLAT · LOD 2</span>
          </div>
        </div>
        <ChatPanel caseId={caseId} />
      </section>

      <EvidenceTimeline events={timeline} />
    </div>
  );
}
