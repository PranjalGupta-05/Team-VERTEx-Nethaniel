import { Clock3 } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";

export function EvidenceTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <section className="surface mt-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock3 size={13} className="text-cyan" />
          <span className="eyebrow">Evidence timeline</span>
        </div>
        <span className="mono text-[8px] text-[#5e6b68]">UTC · {events.length} EVENTS</span>
      </div>
      <div className="overflow-x-auto px-5 pb-4 pt-5">
        <div className="relative flex min-w-[760px] gap-3">
          <div className="absolute left-0 right-0 top-[11px] h-px bg-gradient-to-r from-cyan/50 via-white/15 to-acid/40" />
          {events.map((event, index) => (
            <article key={event.id} className="relative flex-1 pt-6">
              <span className={`absolute left-0 top-[7px] h-[9px] w-[9px] rounded-full border-2 border-[#111719] ${index === events.length - 1 ? "bg-acid shadow-[0_0_12px_#c5f66f]" : "bg-cyan"}`} />
              <time className="mono text-[8px] text-[#667370]">
                {new Date(event.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
              </time>
              <h3 className="mt-1 text-[10px] font-semibold text-[#dbe5e2]">{event.title}</h3>
              <p className="mt-1 line-clamp-2 text-[8px] leading-[14px] text-[#687572]">{event.description}</p>
              {event.confidence && <span className="mono mt-2 inline-block text-[7px] text-cyan">{(event.confidence * 100).toFixed(1)}% CONF.</span>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
