"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, Command, Search, LogOut, ShieldCheck, User, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { sounds } from "@/lib/sound-effects";

interface TopbarProps {
  onLogout?: (() => void) | undefined;
}

export function Topbar({ onLogout }: TopbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("investigator@crimevision.internal");
  const [userName, setUserName] = useState<string>("Lead Investigator");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUserProfile = async () => {
    // Check localStorage first for instant user details
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("auth_user_name");
      const storedEmail = localStorage.getItem("auth_user_email");

      if (storedName && storedName.trim()) setUserName(storedName);
      if (storedEmail && storedEmail.trim()) setUserEmail(storedEmail);
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const email = authData.user.email || "investigator@crimevision.internal";
        setUserEmail(email);

        let name = authData.user.user_metadata?.full_name;

        if (!name) {
          const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("full_name")
            .eq("id", authData.user.id)
            .single();

          if (profile?.full_name) {
            name = profile.full_name;
          }
        }

        if (!name && email) {
          const parts = email.split("@");
          const firstPart = parts[0] || "investigator";
          name = firstPart.replace(/[._]/g, " ");
          name = name.charAt(0).toUpperCase() + name.slice(1);
        }

        if (name) {
          setUserName(name);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchUserProfile();

    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { data } = supabase.auth.onAuthStateChange(() => {
        fetchUserProfile();
      });
      authListener = data;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleToggleMenu = () => {
    sounds.playFocus();
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    sounds.playKeystroke();
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user_name");
      localStorage.removeItem("auth_user_email");
      localStorage.removeItem("crimevision_authenticated");
      sessionStorage.removeItem("splash_seen");
    }
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        await supabase.auth.signOut();
      }
    } catch {}

    if (onLogout) {
      onLogout();
    } else {
      window.location.href = "/auth";
    }
  };

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "IV";

  return (
    <header className="flex h-[78px] items-center justify-between border-b border-white/[0.07] select-none">
      {/* Search Input */}
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[#71807e] focus-within:border-cyan/30 max-[680px]:hidden">
        <Search size={15} />
        <input
          aria-label="Search cases and evidence"
          placeholder="Search cases, evidence, entities…"
          className="w-[280px] bg-transparent text-xs text-white outline-none placeholder:text-[#596664]"
        />
        <span className="mono flex items-center gap-1 rounded border border-white/[0.08] px-1.5 py-0.5 text-[8px]">
          <Command size={9} /> K
        </span>
      </div>

      {/* Right User Bar & Dropdown */}
      <div className="ml-auto flex items-center gap-3">
        <span className="status-pill max-[680px]:hidden">
          <span className="status-dot" />
          SECURE TERMINAL
        </span>

        <button
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#9aaba8] transition hover:text-white"
        >
          <Bell size={15} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-acid" />
        </button>

        {/* Dynamic User Profile Menu Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggleMenu}
            className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-slate-950/60 py-1.5 pl-1.5 pr-2 text-left hover:border-cyan-400/50 hover:bg-slate-900/80 transition-all shadow-md"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-teal-600 text-[10px] font-bold text-slate-950 shadow-sm">
              {initials}
            </span>
            <span className="max-[680px]:hidden">
              <strong className="block text-[10px] font-semibold text-[#edf6f4] truncate max-w-[130px]">
                {userName}
              </strong>
              <span className="mono block text-[8px] text-[#687572] tracking-wider">
                INVESTIGATOR
              </span>
            </span>
            <ChevronDown
              size={12}
              className={`text-[#667371] max-[680px]:hidden transition-transform duration-200 ${
                isOpen ? "rotate-180 text-cyan-400" : ""
              }`}
            />
          </button>

          {/* User Profile Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-slate-950/95 border border-white/15 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl z-50 space-y-2 text-left"
              >
                {/* User Header Info */}
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/10 flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 text-xs font-bold text-slate-950 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{userName}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">{userEmail}</div>
                    <div className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Clearance L4</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-0.5 pt-1 text-xs font-mono">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>My Profile Credentials</span>
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terminal Settings</span>
                  </button>
                </div>

                <div className="border-t border-white/10 pt-1">
                  {/* Log Out Button */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-xs font-mono font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Log Out Session</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
