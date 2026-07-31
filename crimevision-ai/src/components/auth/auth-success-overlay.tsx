"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

interface AuthSuccessOverlayProps {
  userName?: string;
  onComplete: () => void;
}

export const AuthSuccessOverlay: React.FC<AuthSuccessOverlayProps> = ({
  userName = "Investigator",
  onComplete,
}) => {
  useEffect(() => {
    sounds.playSuccess();

    const timer = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="relative w-full max-w-sm bg-slate-900/90 border border-white/20 rounded-2xl p-6 shadow-[0_0_60px_rgba(84,231,218,0.2)] text-center space-y-5 overflow-hidden"
      >
        {/* Specular Background Shine */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

        {/* Formal Animated Shield Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-slate-950 border border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
          >
            <ShieldCheck className="w-8 h-8 text-emerald-400 stroke-[2]" />
          </motion.div>
        </div>

        {/* Header Content */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
            Authentication Verified
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight pt-1">
            Welcome, {userName}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto font-mono">
            Session token cryptographically verified. Loading terminal...
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/10 p-0.5">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
            />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>Entering Workspace</span>
            <ArrowRight className="w-3 h-3 text-cyan-400 animate-pulse" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
