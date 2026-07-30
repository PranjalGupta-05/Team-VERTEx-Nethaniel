"use client";

import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { useApi } from "@/lib/api-provider";

export function CreateCaseDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { request } = useApi();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await request("/cases", {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"),
          location: form.get("location") || undefined,
          description: form.get("description") || undefined,
          priority: Number(form.get("priority"))
        })
      });
      setOpen(false);
      onCreated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the case.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-[10px] font-bold text-[#06100f] shadow-[0_8px_30px_rgba(84,231,218,.12)] transition hover:bg-[#75f1e6]"
      >
        <Plus size={14} strokeWidth={2.2} /> NEW CASE
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="new-case-title">
          <form onSubmit={submit} className="surface w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Case intake</p>
                <h2 id="new-case-title" className="mt-2 text-xl font-semibold">Establish a new workspace</h2>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="text-[#73817f] hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-[10px] font-semibold text-[#9eaaa8]">
                CASE TITLE
                <input required minLength={3} maxLength={160} name="title" placeholder="Riverside warehouse incident" className="rounded-xl border border-white/[0.1] bg-black/20 px-3 py-3 text-xs text-white outline-none focus:border-cyan/50" />
              </label>
              <label className="grid gap-2 text-[10px] font-semibold text-[#9eaaa8]">
                LOCATION
                <input name="location" maxLength={240} placeholder="District, address, or scene reference" className="rounded-xl border border-white/[0.1] bg-black/20 px-3 py-3 text-xs text-white outline-none focus:border-cyan/50" />
              </label>
              <label className="grid gap-2 text-[10px] font-semibold text-[#9eaaa8]">
                INITIAL SYNOPSIS
                <textarea name="description" maxLength={4000} rows={3} placeholder="Concise, objective incident context…" className="resize-none rounded-xl border border-white/[0.1] bg-black/20 px-3 py-3 text-xs leading-5 text-white outline-none focus:border-cyan/50" />
              </label>
              <label className="grid gap-2 text-[10px] font-semibold text-[#9eaaa8]">
                PRIORITY
                <select name="priority" defaultValue="2" className="rounded-xl border border-white/[0.1] bg-[#111719] px-3 py-3 text-xs text-white outline-none focus:border-cyan/50">
                  <option value="1">Critical</option>
                  <option value="2">High</option>
                  <option value="3">Standard</option>
                  <option value="4">Low</option>
                </select>
              </label>
            </div>
            {error && <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-[10px] text-red-300">{error}</p>}
            <button disabled={submitting} className="mt-6 w-full rounded-xl bg-cyan py-3 text-[10px] font-bold tracking-[0.08em] text-[#06100f] disabled:opacity-50">
              {submitting ? "ESTABLISHING…" : "CREATE SECURE CASE"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
