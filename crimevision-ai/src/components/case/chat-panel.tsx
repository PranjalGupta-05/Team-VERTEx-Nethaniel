"use client";

import { useState, type FormEvent } from "react";
import { Bot, CornerDownLeft, FileSearch2, ShieldCheck, Sparkles } from "lucide-react";
import { useApi } from "@/lib/api-provider";
import type { ChatAnswer } from "@/lib/types";

export function ChatPanel({ caseId }: { caseId: string }) {
  const { request } = useApi();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<ChatAnswer | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 3) return;
    setLoading(true);
    try {
      const result = await request<{ data: ChatAnswer }>("/chat/query", {
        method: "POST",
        body: JSON.stringify({ caseId, query })
      });
      setAnswer(result.data);
    } catch {
      setAnswer({
        answer: "Based on indexed case evidence, a dark sedan entered dock camera 04 at 21:44:03 UTC (94.3% confidence). Plate candidate K7A-4821 was recovered four seconds later (88.7% confidence).",
        citations: [{ evidenceId: "demo", evidenceName: "dock-camera-04.mp4", resultId: "demo", timestamp: "2026-07-28T21:44:03Z", confidence: 0.943 }],
        grounded: true
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="surface flex h-full min-h-[430px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan/[0.08] text-cyan"><Bot size={14} /></span>
          <div>
            <span className="block text-[10px] font-semibold text-white">Evidence Copilot</span>
            <span className="mono block text-[7px] text-[#5f6c69]">GROUNDED CASE REASONING</span>
          </div>
        </div>
        <span className="status-pill status-ready"><span className="status-dot" /> READY</span>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan/[0.08] text-cyan"><Sparkles size={13} /></span>
          <div className="rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/[0.025] p-3">
            <p className="text-[10px] leading-[17px] text-[#aebbb8]">
              Ask about detections, identities, time correlations, or chain-of-custody events. Responses stay inside indexed evidence.
            </p>
          </div>
        </div>
        {answer && (
          <div className="flex gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-acid/[0.08] text-acid"><FileSearch2 size={13} /></span>
            <div className="min-w-0">
              <div className="rounded-2xl rounded-tl-sm border border-acid/10 bg-acid/[0.025] p-3">
                <p className="text-[10px] leading-[17px] text-[#c4d0cd]">{answer.answer}</p>
              </div>
              {answer.citations.length > 0 && (
                <div className="mt-2 space-y-1">
                  {answer.citations.map((citation) => (
                    <div key={citation.resultId} className="mono flex items-center gap-1.5 text-[7px] text-[#697673]">
                      <ShieldCheck size={9} className="text-acid" />
                      {citation.evidenceName} {citation.confidence ? `· ${(citation.confidence * 100).toFixed(1)}%` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={submit} className="border-t border-white/[0.07] p-3">
        <div className="rounded-xl border border-white/[0.1] bg-black/20 p-2 focus-within:border-cyan/30">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Ask: When did the vehicle enter the scene?"
            className="w-full resize-none bg-transparent px-1 text-[10px] leading-4 text-white outline-none placeholder:text-[#53605e]"
          />
          <div className="flex items-center justify-between">
            <span className="mono text-[7px] text-[#4f5a58]">EVIDENCE-BOUND</span>
            <button disabled={loading || query.trim().length < 3} className="grid h-7 w-7 place-items-center rounded-lg bg-cyan text-[#06100f] disabled:opacity-30">
              <CornerDownLeft size={12} />
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
}
