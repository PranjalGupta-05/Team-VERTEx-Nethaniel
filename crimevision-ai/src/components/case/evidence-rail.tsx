"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileImage, FileVideo2, Hash, Plus, UploadCloud } from "lucide-react";
import type { EvidenceSummary } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApi } from "@/lib/api-provider";

function formatBytes(value: string): string {
  const bytes = Number(value);
  if (bytes > 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.round(bytes / 1_000)} KB`;
}

export function EvidenceRail({ caseId, evidence, onUploaded }: { caseId: string; evidence: EvidenceSummary[]; onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { request } = useApi();

  async function upload(file: File) {
    setUploading(true);
    setMessage(null);
    const data = new FormData();
    data.set("caseId", caseId);
    data.set("file", file);
    try {
      await request("/evidence/upload", { method: "POST", body: data });
      setMessage("Evidence secured and queued.");
      onUploaded();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <aside className="flex h-full min-h-[430px] flex-col border-r border-white/[0.07] bg-[#0d1214]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-3.5">
        <div>
          <span className="eyebrow">Evidence</span>
          <span className="mono ml-2 text-[8px] text-[#596563]">{String(evidence.length).padStart(2, "0")} ITEMS</span>
        </div>
        <button onClick={() => inputRef.current?.click()} aria-label="Upload evidence" className="grid h-7 w-7 place-items-center rounded-lg border border-white/[0.08] text-[#8d9a98] hover:border-cyan/30 hover:text-cyan">
          <Plus size={13} />
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.json,.csv"
          onChange={(event) => event.target.files?.[0] && void upload(event.target.files[0])}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {evidence.map((item, index) => {
          const Icon = item.mimeType.startsWith("video/") ? FileVideo2 : FileImage;
          return (
            <button key={item.id} className={`block w-full border-b border-white/[0.055] px-3 py-3 text-left transition hover:bg-white/[0.025] ${index === 0 ? "bg-cyan/[0.035] shadow-[inset_2px_0_0_#54e7da]" : ""}`}>
              <div className="flex gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-[#788683]">
                  <Icon size={14} strokeWidth={1.6} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[10px] font-semibold text-[#d4dfdc]">{item.originalName}</span>
                  <span className="mono mt-1 block text-[7px] text-[#5f6c69]">{item.modality} · {formatBytes(item.byteSize)}</span>
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <StatusBadge status={item.status} />
                <span className="mono flex items-center gap-1 text-[7px] text-[#596563]">
                  <Hash size={8} /> {item.fileHash.slice(0, 8)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="border-t border-white/[0.07] p-3">
        {message && <p className="mb-2 text-[8px] leading-4 text-[#8e9b98]">{message}</p>}
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] py-2.5 text-[9px] font-semibold text-[#82908d] transition hover:border-cyan/30 hover:text-cyan disabled:opacity-50">
          {uploading ? <><UploadCloud size={12} className="animate-bounce" /> SECURING FILE…</> : <><CheckCircle2 size={12} /> ADD EVIDENCE</>}
        </button>
      </div>
    </aside>
  );
}
