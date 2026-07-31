"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, ShieldAlert, ShieldCheck } from "lucide-react";

interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthProps> = ({
  password = "",
}) => {
  const checks = [
    { label: "8+ chars", valid: password.length >= 8 },
    { label: "Uppercase (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Lowercase (a-z)", valid: /[a-z]/.test(password) },
    { label: "Number (0-9)", valid: /[0-9]/.test(password) },
    { label: "Symbol (@#$%)", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const validCount = checks.filter((c) => c.valid).length;
  const score = password.length === 0 ? 0 : Math.round((validCount / checks.length) * 100);

  const getLabel = () => {
    if (score === 0) return { text: "Security", color: "text-slate-400", bg: "bg-slate-700" };
    if (score <= 40) return { text: "Weak Shield", color: "text-rose-400", bg: "bg-rose-500" };
    if (score <= 75) return { text: "Fair Shield", color: "text-amber-400", bg: "bg-amber-500" };
    if (score < 100) return { text: "Strong Shield", color: "text-emerald-400", bg: "bg-emerald-500" };
    return { text: "Fortress Vault", color: "text-cyan-300", bg: "bg-gradient-to-r from-cyan-400 to-emerald-400" };
  };

  const status = getLabel();

  if (password.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-1.5 p-2 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/10 space-y-1.5"
    >
      {/* Header & Percentage */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="flex items-center gap-1 font-medium text-slate-300">
          {score >= 80 ? (
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
          ) : (
            <ShieldAlert className="w-3 h-3 text-amber-400" />
          )}
          <span>{status.text}</span>
        </span>
        <span className={`font-semibold ${status.color}`}>{score}%</span>
      </div>

      {/* Segmented Strength Bar */}
      <div className="flex gap-1 h-1 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
        {[20, 40, 60, 80, 100].map((step, idx) => (
          <motion.div
            key={idx}
            className={`h-full flex-1 rounded-full transition-all duration-300 ${
              score >= step ? status.bg : "bg-slate-800"
            }`}
            animate={{
              scaleY: score >= step ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          />
        ))}
      </div>

      {/* Detailed Checklist */}
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        {checks.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1 transition-colors duration-200 ${
              item.valid ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full flex items-center justify-center border ${
                item.valid
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-slate-800/50 border-slate-700 text-slate-600"
              }`}
            >
              {item.valid ? (
                <Check className="w-2 h-2 stroke-[3]" />
              ) : (
                <X className="w-2 h-2" />
              )}
            </div>
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
