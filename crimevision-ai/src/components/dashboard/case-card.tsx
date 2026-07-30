import { ArrowUpRight, Database, MapPin } from "lucide-react";
import Link from "next/link";
import type { CaseSummary } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";

function relativeTime(date: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function CaseCard({ caseItem }: { caseItem: CaseSummary }) {
  return (
    <Link href={`/cases/${caseItem.id}`} className="surface surface-interactive group block p-4 no-underline">
      <div className="flex items-start justify-between gap-3">
        <span className="mono text-[9px] font-bold tracking-[0.12em] text-cyan">{caseItem.reference}</span>
        <ArrowUpRight size={15} className="text-[#4e5c5a] transition group-hover:text-cyan" />
      </div>
      <h3 className="mt-3 line-clamp-1 text-[14px] font-semibold tracking-[-0.015em] text-[#eef7f5]">{caseItem.title}</h3>
      <p className="mt-1 line-clamp-2 min-h-9 text-[10px] leading-[18px] text-[#75827f]">
        {caseItem.description ?? "No case synopsis has been provided."}
      </p>
      <div className="mt-4 flex items-center gap-3 border-t border-white/[0.06] pt-3">
        <StatusBadge status={caseItem.status} />
        <span className="ml-auto flex items-center gap-1 text-[9px] text-[#697674]">
          <Database size={11} /> {caseItem._count.evidence}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-[9px] text-[#56625f]">
        <span className="flex min-w-0 items-center gap-1 truncate">
          <MapPin size={10} /> {caseItem.location ?? "Location pending"}
        </span>
        <span className="mono shrink-0">{relativeTime(caseItem.updatedAt)}</span>
      </div>
    </Link>
  );
}
