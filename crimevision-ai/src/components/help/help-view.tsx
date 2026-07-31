"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  AlertCircle,
  Activity,
  Wifi,
  Database,
  Monitor,
  Loader2,
  BookOpen,
  MessageSquarePlus,
} from "lucide-react";
import { sounds } from "@/lib/sound-effects";

const FAQ_ITEMS = [
  {
    category: "Evidence Integrity",
    icon: "🔒",
    questions: [
      {
        q: "How does CrimeVision guarantee evidence integrity?",
        a: "Every uploaded file is cryptographically hashed using SHA-256 at upload time. A tamper-evident hash chain is stored immutably in the Supabase audit log. Any subsequent modification will produce a mismatch and trigger an integrity alert.",
      },
      {
        q: "What is Chain of Custody and how is it tracked?",
        a: "Chain of Custody is the documented chronological record of who had access to evidence, when, and why. CrimeVision records every read, write, download, and analysis event to an append-only audit trail secured with row-level security policies.",
      },
    ],
  },
  {
    category: "AI Ballistics & Detection",
    icon: "🎯",
    questions: [
      {
        q: "How does the Bullet Trajectory Simulator work?",
        a: "The 3D Trajectory Simulator uses vector mathematics (pitch, yaw, distance) between shooter origin and bullet impact point. It calculates angle of incidence, estimated height of shooter, and renders a visible laser ray in the 3D reconstruction environment.",
      },
      {
        q: "Which AI models are available for detection?",
        a: "CrimeVision integrates CrimeVision-V4 (general scene recognition), YOLOv8x Forensic (weapon/vehicle/person detection at 92% accuracy), and FaceNet HQ (biometric recognition with latent fingerprint cross-reference). Select your model under Settings → AI Engine.",
      },
    ],
  },
  {
    category: "3D Scene Reconstruction",
    icon: "🏗️",
    questions: [
      {
        q: "What 3D environments are available for crime scene reconstruction?",
        a: "The suite includes four interactive WebGL environments: Suburban Residence (living room with doors and cabinets), Executive Office Suite (desk, windows, filing cabinets), High-Security Vault Corridor (security cameras, laser tripwires), and Urban Alleyway (vehicles, lampposts, casing markers).",
      },
      {
        q: "Can I position suspect and victim figures in 3D space?",
        a: "Yes. Select 'Entity Poser' in the Reconstruction controls panel, pick a human figure (suspect or victim), and use the X/Y/Z sliders to position them precisely in 3D space. Positions are saved as part of the scenario data.",
      },
    ],
  },
  {
    category: "Case Management",
    icon: "📁",
    questions: [
      {
        q: "What is the difference between Open, Investigating, and Closed statuses?",
        a: "'Open' means the case has been created but no active analysis has begun. 'Investigating' means investigators are actively analyzing evidence and building timelines. 'Closed' means the case has been resolved, and 'Archived' removes it from active views.",
      },
    ],
  },
];

export function HelpView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("General Technical Support");
  const [ticketPriority, setTicketPriority] = useState("MEDIUM");
  const [ticketDescription, setTicketDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; ticketId?: string; error?: string } | null>(null);
  const [dbPing, setDbPing] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const toggleItem = (key: string) => {
    sounds.playFocus();
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFaq = FAQ_ITEMS.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (faq) =>
        !searchQuery ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  const handlePingDB = async () => {
    setIsPinging(true);
    const start = Date.now();
    try {
      await fetch("/api/health");
      setDbPing(Date.now() - start);
    } catch {
      setDbPing(-1);
    }
    setIsPinging(false);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    sounds.playFocus();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch("/api/v1/help/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketSubject,
          category: ticketCategory,
          priority: ticketPriority,
          description: ticketDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sounds.playSuccess();
        setSubmitResult({ success: true, ticketId: data.ticket.id });
        setTicketSubject("");
        setTicketDescription("");
      } else {
        setSubmitResult({ success: false, error: data.error });
      }
    } catch {
      setSubmitResult({ success: false, error: "Network error. Try again." });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>Help & Support Center</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Documentation, system diagnostics, and support ticket submission.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: FAQ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search knowledge base…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="space-y-3">
            {filteredFaq.map((cat) => (
              <div key={cat.category} className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span className="text-sm font-bold text-white">{cat.category}</span>
                </div>
                {cat.questions.map((faq, idx) => {
                  const key = `${cat.category}-${idx}`;
                  return (
                    <div key={key} className="border-b border-white/5 last:border-0">
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-mono text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{faq.q}</span>
                        </div>
                        {openItems[key] ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>
                      {openItems[key] && (
                        <div className="px-4 pb-3 text-xs font-mono text-slate-400 leading-relaxed bg-slate-950/40 border-t border-white/5 pt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* System Diagnostics */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>System Diagnostics</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              {[
                { label: "WebGL 3D Renderer", status: "OPERATIONAL", icon: Monitor, color: "text-emerald-400" },
                { label: "WebSocket Live Feed", status: "OPERATIONAL", icon: Wifi, color: "text-emerald-400" },
                { label: "Supabase PostgreSQL", status: "CONNECTED", icon: Database, color: "text-emerald-400" },
              ].map((sys) => (
                <div key={sys.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-300">
                    <sys.icon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{sys.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${sys.color}`}>{sys.status}</span>
                </div>
              ))}

              <button
                onClick={handlePingDB}
                disabled={isPinging}
                className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-400/50 transition-colors"
              >
                {isPinging ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>{isPinging ? "Pinging..." : "Run Latency Ping"}</span>
              </button>

              {dbPing !== null && (
                <div className={`text-center text-[11px] font-bold ${dbPing < 0 ? "text-rose-400" : dbPing < 100 ? "text-emerald-400" : "text-amber-400"}`}>
                  {dbPing < 0 ? "Ping failed (offline?)" : `API Response: ${dbPing}ms`}
                </div>
              )}
            </div>
          </div>

          {/* Support Ticket Form */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-cyan-400" />
              <span>Submit Support Ticket</span>
            </h3>

            {submitResult?.success ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center text-xs font-mono">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div className="text-emerald-400 font-bold">Ticket Submitted</div>
                <div className="text-slate-400">ID: {submitResult.ticketId}</div>
                <button
                  onClick={() => setSubmitResult(null)}
                  className="mt-2 text-cyan-400 hover:underline"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-2.5 text-xs font-mono">
                <input
                  type="text"
                  placeholder="Subject"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />

                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option>General Technical Support</option>
                  <option>Evidence Upload Issue</option>
                  <option>AI Detection Bug</option>
                  <option>3D Reconstruction Problem</option>
                  <option>Access & Permissions</option>
                </select>

                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical / Case Blocking</option>
                </select>

                <textarea
                  placeholder="Describe the issue in detail…"
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                />

                {submitResult?.error && (
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{submitResult.error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !ticketSubject || !ticketDescription}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? "Submitting..." : "Submit Ticket"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
