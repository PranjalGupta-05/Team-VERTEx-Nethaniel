"use client";

import { ShieldAlert } from "lucide-react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="grid min-h-[70vh] place-items-center">
      <div className="surface max-w-md p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-400/10 text-red-300">
          <ShieldAlert />
        </span>
        <p className="eyebrow mt-5">Protected failure boundary</p>
        <h1 className="mt-2 text-2xl font-semibold">This workspace could not be rendered.</h1>
        <p className="mt-3 text-sm leading-6 text-[#8d9a98]">{error.message}</p>
        <button onClick={reset} className="mt-6 rounded-xl bg-cyan px-5 py-2.5 text-xs font-bold text-[#07100f]">
          Retry workspace
        </button>
      </div>
    </section>
  );
}
