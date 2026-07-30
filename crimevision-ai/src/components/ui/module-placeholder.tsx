import type { LucideIcon } from "lucide-react";

export function ModulePlaceholder({ eyebrow, title, description, icon: Icon }: { eyebrow: string; title: string; description: string; icon: LucideIcon }) {
  return (
    <div className="py-7">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 text-[29px] font-semibold tracking-[-0.04em]">{title}</h1>
      <p className="mt-1 text-[11px] text-[#74817f]">{description}</p>
      <section className="surface mt-7 grid min-h-[420px] place-items-center text-center">
        <div className="max-w-sm px-6">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-cyan/20 bg-cyan/[0.05] text-cyan"><Icon size={21} strokeWidth={1.5} /></span>
          <h2 className="mt-5 text-lg font-semibold">Module boundary established</h2>
          <p className="mt-2 text-[10px] leading-5 text-[#74817f]">This surface is wired into the shared operator shell and ready for its deployment-specific data adapter.</p>
        </div>
      </section>
    </div>
  );
}
