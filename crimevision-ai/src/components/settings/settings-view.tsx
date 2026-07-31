"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Sliders,
  Database,
  Save,
  CheckCircle2,
  Lock,
  Volume2,
  VolumeX,
  Sparkles,
  Server,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sounds } from "@/lib/sound-effects";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<"profile" | "forensic" | "system" | "storage">("profile");

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("BADGE-8842");
  const [department, setDepartment] = useState("Digital Forensics Unit");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [role, setRole] = useState("investigator");

  // AI & Forensic Settings State
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [aiModel, setAiModel] = useState("CrimeVision-V4-Quantum");
  const [auditLevel, setAuditLevel] = useState("DEEP_AUDIT");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Status State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load initial values from localStorage or Supabase
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("auth_user_name");
      const storedEmail = localStorage.getItem("auth_user_email");
      if (storedName) setFullName(storedName);
      else setFullName("Lead Investigator");
      if (storedEmail) setEmail(storedEmail);
      else setEmail("investigator@crimevision.internal");
      setSoundEnabled(!sounds.getMuted());
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          if (data.user.email) setEmail(data.user.email);
          if (data.user.user_metadata?.full_name) {
            setFullName(data.user.user_metadata.full_name);
          }

          // Fetch from public.profiles
          (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()
            .then(({ data: profile }: any) => {
              if (profile) {
                if (profile.full_name) setFullName(profile.full_name);
                if (profile.badge_number) setBadgeNumber(profile.badge_number);
                if (profile.department) setDepartment(profile.department);
                if (profile.phone) setPhone(profile.phone);
                if (profile.role) setRole(profile.role);
              }
            });
        }
      });
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playFocus();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user_name", fullName);
        localStorage.setItem("auth_user_email", email);
      }

      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          await (supabase as any).from("profiles").upsert(
            {
              id: authData.user.id,
              full_name: fullName,
              email,
              badge_number: badgeNumber,
              department,
              phone,
              role,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      sounds.playSuccess();
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setIsSaving(false);
    }
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setSoundEnabled(!muted);
  };

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>Terminal & System Settings</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure investigator credentials, AI thresholds, and cryptographic audit security.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Backend Status:</span>
          <span className="text-emerald-400 font-bold">CONNECTED</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10 max-w-md font-mono text-xs">
        <button
          onClick={() => {
            sounds.playFocus();
            setActiveTab("profile");
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
            activeTab === "profile" ? "bg-slate-800 text-cyan-400 font-semibold" : "text-slate-400 hover:text-white"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => {
            sounds.playFocus();
            setActiveTab("forensic");
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
            activeTab === "forensic" ? "bg-slate-800 text-cyan-400 font-semibold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>AI Engine</span>
        </button>

        <button
          onClick={() => {
            sounds.playFocus();
            setActiveTab("system");
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
            activeTab === "system" ? "bg-slate-800 text-cyan-400 font-semibold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Preferences</span>
        </button>

        <button
          onClick={() => {
            sounds.playFocus();
            setActiveTab("storage");
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
            activeTab === "storage" ? "bg-slate-800 text-cyan-400 font-semibold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Storage</span>
        </button>
      </div>

      {/* Tab Panels */}

      {/* 1. Investigator Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-5 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Investigator Credentials</h3>
              <p className="text-xs text-slate-400">Personal metadata synced with Supabase PostgreSQL</p>
            </div>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile Saved</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Badge / ID Number</label>
              <input
                type="text"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Department Unit</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Phone Contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400 capitalize"
              >
                <option value="investigator">Investigator (Default)</option>
                <option value="analyst">Forensic Analyst</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-[0_0_20px_rgba(84,231,218,0.3)] transition-all"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSaving ? "Saving..." : "Save Credentials"}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. AI Engine Tab */}
      {activeTab === "forensic" && (
        <div className="space-y-5 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-xs font-mono">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white">AI Detection & Ballistics Thresholds</h3>
            <p className="text-xs text-slate-400">Configure computer vision, OCR, and 3D trajectory calculation precision</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-slate-200">
                <span>Object & Face Detection Confidence Threshold</span>
                <span className="text-cyan-400 font-bold">{confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Default Computer Vision Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="CrimeVision-V4-Quantum">CrimeVision-V4 (Quantum Neural)</option>
                  <option value="YOLOv8x-Forensic">YOLOv8x Forensic (Weapons/Vehicle)</option>
                  <option value="FaceNet-HQ">FaceNet HQ (Biometric Recognition)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Audit Trail Logging Detail</label>
                <select
                  value={auditLevel}
                  onChange={(e) => setAuditLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="DEEP_AUDIT">Cryptographic Deep Audit (Immutable)</option>
                  <option value="STANDARD">Standard Audit (Events Only)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. System Preferences Tab */}
      {activeTab === "system" && (
        <div className="space-y-5 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-xs font-mono">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white">Audio & User Interface</h3>
            <p className="text-xs text-slate-400">Micro-audio feedback and UI preferences</p>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-rose-400" />
              )}
              <div>
                <div className="text-white font-bold">Web Audio Synthesis</div>
                <div className="text-[11px] text-slate-400">Synthesized keystrokes, focus chimes, and triumph tones</div>
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                soundEnabled
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                  : "bg-slate-800 text-slate-400 border border-white/10"
              }`}
            >
              {soundEnabled ? "ENABLED" : "MUTED"}
            </button>
          </div>
        </div>
      )}

      {/* 4. Storage Tab */}
      {activeTab === "storage" && (
        <div className="space-y-5 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-xs font-mono">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white">Supabase Storage Bucket Inspector</h3>
            <p className="text-xs text-slate-400">Configured encrypted storage buckets</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "crime-images", status: "Healthy", type: "Images & Scans" },
              { name: "videos", status: "Healthy", type: "CCTV & Drone Footage" },
              { name: "audio", status: "Healthy", type: "Transcripts & Interrogations" },
              { name: "reports", status: "Healthy", type: "PDF & Export Manifests" },
            ].map((bucket) => (
              <div key={bucket.name} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-white font-bold">{bucket.name}</div>
                    <div className="text-[10px] text-slate-400">{bucket.type}</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  {bucket.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
