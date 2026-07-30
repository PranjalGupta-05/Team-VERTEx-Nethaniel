import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  trend,
  accent = "cyan"
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  trend: number[];
  accent?: "cyan" | "acid" | "amber";
}) {
  const color = accent === "acid" ? "#c5f66f" : accent === "amber" ? "#f4c66a" : "#54e7da";
  const points = trend
    .map((item, index) => `${(index / (trend.length - 1)) * 100},${30 - (item / Math.max(...trend)) * 25}`)
    .join(" ");

  return (
    <article className="surface surface-interactive relative min-h-[148px] overflow-hidden p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mono text-[9px] font-bold uppercase tracking-[0.13em] text-[#75827f]">{label}</p>
          <p className="mt-2 text-[27px] font-semibold tracking-[-0.04em] text-white">{value}</p>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03]" style={{ color }}>
          <Icon size={15} strokeWidth={1.8} />
        </span>
      </div>
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
        <span className="text-[10px] text-[#65726f]">{detail}</span>
        <svg viewBox="0 0 100 32" className="h-8 w-20 overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={`fade-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity=".25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <polygon points={`0,32 ${points} 100,32`} fill={`url(#fade-${label})`} />
        </svg>
      </div>
    </article>
  );
}
