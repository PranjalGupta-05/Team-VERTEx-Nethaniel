"use client";

import { useState, useCallback } from "react";
import {
  X,
  FileText,
  FileJson2,
  Download,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Clock3,
  Brain,
  Database,
  Eye,
  ScanSearch,
  BarChart3,
  Info,
} from "lucide-react";
import { useApi } from "@/lib/api-provider";

interface ReportSection {
  id: string;
  label: string;
  description: string;
  icon: typeof FileText;
  enabled: boolean;
}

const defaultSections: ReportSection[] = [
  { id: "caseSummary", label: "Case Summary", description: "Reference, status, priority, owner details", icon: FileText, enabled: true },
  { id: "evidence", label: "Evidence Inventory", description: "All evidence items with integrity hashes", icon: Database, enabled: true },
  { id: "timeline", label: "Event Timeline", description: "Chronological sequence of detected events", icon: Clock3, enabled: true },
  { id: "aiFindings", label: "AI Findings", description: "All analysis results across models", icon: Brain, enabled: true },
  { id: "detections", label: "Detection Results", description: "Object and entity detection outputs", icon: Eye, enabled: true },
  { id: "ocrResults", label: "OCR Results", description: "Extracted text from images and video", icon: ScanSearch, enabled: true },
  { id: "confidenceScores", label: "Confidence Scores", description: "Confidence metrics by analysis type", icon: BarChart3, enabled: true },
  { id: "metadata", label: "Report Metadata", description: "Certification hash, version, timestamps", icon: Info, enabled: true },
];

type Format = "pdf" | "json";
type GenerateState = "idle" | "generating" | "success" | "error";

export function ReportGenerator({
  caseId,
  caseReference,
  onClose,
}: {
  caseId: string;
  caseReference: string;
  onClose: () => void;
}) {
  const { request } = useApi();
  const [format, setFormat] = useState<Format>("pdf");
  const [sections, setSections] = useState<ReportSection[]>(defaultSections);
  const [state, setState] = useState<GenerateState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const toggleSection = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const enabledCount = sections.filter((s) => s.enabled).length;

  async function handleGenerate() {
    setState("generating");
    setErrorMsg("");

    try {
      const endpoint =
        format === "pdf"
          ? `/reports/cases/${caseId}/pdf`
          : `/reports/cases/${caseId}/full`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api/v1"}${endpoint}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        format === "pdf"
          ? `${caseReference}-report.pdf`
          : `${caseReference}-report.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      setState("success");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 w-full max-w-[540px] overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#131a1d]/98 to-[#0d1214]/98 shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-cyan/30 bg-cyan/[0.08] text-cyan">
              <FileText size={15} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-white">
                Generate Report
              </h2>
              <span className="mono text-[8px] text-[#5e6b68]">
                {caseReference}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-[#6f7c79] transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Format selector */}
        <div className="border-b border-white/[0.07] px-5 py-4">
          <span className="mono text-[8px] font-bold tracking-[0.14em] text-[#7c8a87]">
            OUTPUT FORMAT
          </span>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setFormat("pdf")}
              className={`group flex flex-1 items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
                format === "pdf"
                  ? "border-cyan/40 bg-cyan/[0.06] text-white shadow-[0_0_24px_rgba(84,231,218,0.06)]"
                  : "border-white/[0.08] bg-white/[0.02] text-[#6f7c79] hover:border-white/[0.14] hover:text-[#b0bfbc]"
              }`}
            >
              <FileText
                size={16}
                strokeWidth={1.6}
                className={format === "pdf" ? "text-cyan" : "text-[#596563]"}
              />
              <div className="text-left">
                <span className="block text-[11px] font-semibold">PDF</span>
                <span className="block text-[8px] text-[#596563]">
                  Professional document
                </span>
              </div>
            </button>
            <button
              onClick={() => setFormat("json")}
              className={`group flex flex-1 items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
                format === "json"
                  ? "border-cyan/40 bg-cyan/[0.06] text-white shadow-[0_0_24px_rgba(84,231,218,0.06)]"
                  : "border-white/[0.08] bg-white/[0.02] text-[#6f7c79] hover:border-white/[0.14] hover:text-[#b0bfbc]"
              }`}
            >
              <FileJson2
                size={16}
                strokeWidth={1.6}
                className={format === "json" ? "text-cyan" : "text-[#596563]"}
              />
              <div className="text-left">
                <span className="block text-[11px] font-semibold">JSON</span>
                <span className="block text-[8px] text-[#596563]">
                  Structured data export
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Sections checklist */}
        <div className="max-h-[280px] overflow-y-auto border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="mono text-[8px] font-bold tracking-[0.14em] text-[#7c8a87]">
              REPORT SECTIONS
            </span>
            <span className="mono text-[8px] text-[#505d5a]">
              {enabledCount}/{sections.length} SELECTED
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    section.enabled
                      ? "border-white/[0.1] bg-white/[0.03]"
                      : "border-transparent bg-transparent opacity-40"
                  } hover:border-white/[0.12] hover:bg-white/[0.04]`}
                >
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] transition ${
                      section.enabled
                        ? "border-cyan/50 bg-cyan/20 text-cyan"
                        : "border-white/[0.15] bg-white/[0.03] text-transparent"
                    }`}
                  >
                    {section.enabled && <CheckCircle2 size={10} />}
                  </span>
                  <Icon
                    size={13}
                    strokeWidth={1.6}
                    className={section.enabled ? "text-cyan" : "text-[#505d5a]"}
                  />
                  <div className="min-w-0">
                    <span className="block text-[10px] font-semibold text-[#d4dfdc]">
                      {section.label}
                    </span>
                    <span className="block text-[8px] text-[#596563]">
                      {section.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer / actions */}
        <div className="px-5 py-4">
          {state === "error" && (
            <p className="mb-3 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-[9px] text-red-300">
              {errorMsg}
            </p>
          )}

          {state === "success" ? (
            <div className="flex items-center gap-3 rounded-xl border border-acid/30 bg-acid/[0.06] px-4 py-3">
              <CheckCircle2 size={16} className="text-acid" />
              <div>
                <span className="block text-[11px] font-semibold text-acid">
                  Report downloaded
                </span>
                <span className="block text-[8px] text-[#7c8a87]">
                  {format.toUpperCase()} report for {caseReference} saved
                  successfully.
                </span>
              </div>
              <button
                onClick={() => setState("idle")}
                className="ml-auto text-[8px] font-bold text-[#7c8a87] hover:text-white"
              >
                NEW
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[8px] text-[#596563]">
                <ShieldCheck size={10} className="text-cyan/60" />
                <span className="mono">SHA-256 CERTIFIED</span>
              </div>
              <button
                onClick={() => void handleGenerate()}
                disabled={state === "generating" || enabledCount === 0}
                className="ml-auto flex items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-[10px] font-bold text-[#06100f] transition hover:bg-cyan/90 disabled:opacity-50"
              >
                {state === "generating" ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    GENERATING…
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    GENERATE {format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
