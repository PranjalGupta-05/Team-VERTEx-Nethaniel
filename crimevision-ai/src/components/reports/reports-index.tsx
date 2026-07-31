"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  FileJson2,
  Download,
  Loader2,
  Search,
  ShieldCheck,
  MapPin,
  Database,
  CheckCircle2,
} from "lucide-react";
import { useApi } from "@/lib/api-provider";
import { demoDashboard } from "@/lib/demo-data";
import type { CaseSummary } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";

type Format = "pdf" | "json";

function relativeTime(date: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function ReportsIndex() {
  const { request } = useApi();
  const [cases, setCases] = useState<CaseSummary[]>(demoDashboard.recentCases);
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);

  useEffect(() => {
    void request<{ data: CaseSummary[] }>("/cases")
      .then((result) => setCases(result.data))
      .catch(() => undefined);
  }, [request]);

  const filtered = cases.filter((item) =>
    `${item.reference} ${item.title} ${item.location}`.toLowerCase().includes(query.toLowerCase())
  );

  async function handleDownload(caseItem: CaseSummary, format: Format) {
    const key = `${caseItem.id}-${format}`;
    setGenerating(key);
    setDownloaded(null);

    try {
      const endpoint =
        format === "pdf"
          ? `/reports/cases/${caseItem.id}/pdf`
          : `/reports/cases/${caseItem.id}/full`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api/v1"}${endpoint}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      if (!response.ok) throw new Error("Failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        format === "pdf"
          ? `${caseItem.reference}-report.pdf`
          : `${caseItem.reference}-report.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setDownloaded(key);
    } catch {
      // silent fail
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="py-7">
      <p className="eyebrow">Report center</p>
      <div className="mt-2 flex items-end justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          <h1 className="text-[29px] font-semibold tracking-[-0.04em]">
            Forensic Reports
          </h1>
          <p className="mt-1 text-[11px] text-[#74817f]">
            Generate and download certified forensic reports for any case.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-cyan/60" />
          <span className="mono text-[8px] text-[#596563]">SHA-256 CERTIFIED</span>
        </div>
      </div>

      {/* Search */}
      <div className="surface mt-6 flex items-center gap-2 px-3 py-2.5">
        <Search size={14} className="text-[#687572]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by reference, title, or location…"
          className="w-full bg-transparent text-[11px] text-white outline-none placeholder:text-[#53605d]"
        />
        <span className="mono text-[8px] text-[#596563]">{filtered.length} MATCHES</span>
      </div>

      {/* Case list */}
      <div className="mt-4 space-y-2">
        {filtered.map((item) => {
          const pdfKey = `${item.id}-pdf`;
          const jsonKey = `${item.id}-json`;
          return (
            <div
              key={item.id}
              className="surface surface-interactive flex items-center gap-4 p-4 max-[900px]:flex-col max-[900px]:items-stretch"
            >
              {/* Case info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="mono text-[9px] font-bold tracking-[0.12em] text-cyan">
                    {item.reference}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <h3 className="mt-1.5 truncate text-[13px] font-semibold tracking-[-0.015em] text-[#eef7f5]">
                  {item.title}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[9px] text-[#697674]">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} /> {item.location ?? "Location pending"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Database size={10} /> {item._count.evidence} evidence
                  </span>
                  <span className="mono">{relativeTime(item.updatedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 max-[900px]:justify-end">
                <button
                  onClick={() => void handleDownload(item, "pdf")}
                  disabled={generating === pdfKey}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[9px] font-semibold transition ${
                    downloaded === pdfKey
                      ? "border-acid/30 bg-acid/[0.06] text-acid"
                      : "border-white/[0.09] bg-white/[0.025] text-[#9ba8a5] hover:border-cyan/30 hover:text-cyan"
                  } disabled:opacity-50`}
                >
                  {generating === pdfKey ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : downloaded === pdfKey ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <FileText size={12} />
                  )}
                  PDF
                </button>
                <button
                  onClick={() => void handleDownload(item, "json")}
                  disabled={generating === jsonKey}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[9px] font-semibold transition ${
                    downloaded === jsonKey
                      ? "border-acid/30 bg-acid/[0.06] text-acid"
                      : "border-white/[0.09] bg-white/[0.025] text-[#9ba8a5] hover:border-cyan/30 hover:text-cyan"
                  } disabled:opacity-50`}
                >
                  {generating === jsonKey ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : downloaded === jsonKey ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <FileJson2 size={12} />
                  )}
                  JSON
                </button>
                <button
                  onClick={() => void handleDownload(item, "pdf")}
                  disabled={generating != null}
                  className="flex items-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-[9px] font-bold text-[#06100f] transition hover:bg-cyan/90 disabled:opacity-50"
                >
                  <Download size={12} /> DOWNLOAD
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="surface mt-6 flex flex-col items-center justify-center py-16 text-center">
          <FileText size={28} className="text-[#3a4442]" strokeWidth={1.4} />
          <p className="mt-3 text-[12px] text-[#6f7c79]">No cases match your search.</p>
          <p className="mt-1 text-[9px] text-[#505d5a]">Try adjusting the filter criteria.</p>
        </div>
      )}
    </div>
  );
}
