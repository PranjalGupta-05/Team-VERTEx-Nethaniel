"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Unlock, Fingerprint, Activity, AlertTriangle } from "lucide-react";

interface ForensicSecurityBadgeProps {
  isPasswordVisible?: boolean;
  isPasswordFocused?: boolean;
  passwordLength?: number;
  isSuccess?: boolean;
  hasError?: boolean;
  themeColor?: string;
}

export const ForensicSecurityBadge: React.FC<ForensicSecurityBadgeProps> = ({
  isPasswordVisible = false,
  isPasswordFocused = false,
  passwordLength = 0,
  isSuccess = false,
  hasError = false,
  themeColor = "#54e7da",
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center py-2 select-none">
      {/* Ambient Depth Glow */}
      <div
        className="absolute w-36 h-12 blur-2xl rounded-full opacity-30 transition-all duration-500"
        style={{
          backgroundColor: hasError
            ? "#ef4444"
            : isSuccess
            ? "#10b981"
            : themeColor,
        }}
      />

      {/* Forensic Biometric Status Panel */}
      <div className="relative flex items-center justify-between w-full bg-slate-950/80 border border-white/15 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md font-mono text-xs">
        {/* Left: Security Clearance Badge */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 ${
              hasError
                ? "bg-rose-950/40 border-rose-500/50 text-rose-400"
                : isSuccess
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
                : "bg-slate-900 border-white/20 text-cyan-400"
            }`}
          >
            {hasError ? (
              <AlertTriangle className="w-4 h-4" />
            ) : isSuccess ? (
              <ShieldCheck className="w-4 h-4" />
            ) : isPasswordFocused && !isPasswordVisible ? (
              <Lock className="w-4 h-4 text-amber-400" />
            ) : isPasswordVisible ? (
              <Unlock className="w-4 h-4 text-cyan-400" />
            ) : (
              <Fingerprint className="w-4 h-4" />
            )}
          </div>

          <div className="flex flex-col text-left">
            <div className="text-[11px] font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
              <span>FORENSIC AUTH</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                CLASS 4
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>
                {hasError
                  ? "Validation Warning"
                  : isSuccess
                  ? "Access Granted"
                  : isPasswordFocused && !isPasswordVisible
                  ? "Key Masked (AES-256)"
                  : isPasswordVisible
                  ? "Plaintext Unlocked"
                  : "Biometric Handshake Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Cipher Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${
              hasError
                ? "bg-rose-500 shadow-[0_0_10px_#ef4444]"
                : isSuccess
                ? "bg-emerald-400 shadow-[0_0_10px_#10b981]"
                : "bg-cyan-400 shadow-[0_0_10px_#54e7da]"
            }`}
          />
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">
            {passwordLength > 0 ? `${passwordLength * 8}-BIT` : "READY"}
          </span>
        </div>
      </div>
    </div>
  );
};
