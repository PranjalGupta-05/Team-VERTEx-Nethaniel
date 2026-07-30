"use client";

import React, { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

export interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode | undefined;
  error?: string | undefined;
  isValid?: boolean | undefined;
  rightElement?: React.ReactNode | undefined;
  themeColor?: string | undefined;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  (
    {
      label,
      icon,
      error,
      isValid = false,
      rightElement,
      type = "text",
      value = "",
      onChange,
      onFocus,
      onBlur,
      themeColor = "#54e7da",
      className = "",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = String(value).length > 0;
    const isFloating = isFocused || hasValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      sounds.playFocus();
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      sounds.playKeystroke();
      if (onChange) onChange(e);
    };

    return (
      <div className="relative flex flex-col gap-0.5 w-full text-left select-none">
        {/* Input Wrapper Box */}
        <div
          className={`relative flex items-center w-full min-h-[44px] px-3.5 rounded-xl border transition-all duration-300 ${
            error
              ? "bg-rose-950/20 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              : isFocused
              ? "bg-slate-900/90 border-cyan-400/80 shadow-[0_0_20px_rgba(84,231,218,0.18)]"
              : "bg-slate-950/50 border-white/10 hover:border-white/20 hover:bg-slate-900/40"
          } backdrop-blur-md`}
        >
          {/* Left Icon */}
          {icon && (
            <div
              className={`mr-2.5 transition-colors duration-300 ${
                isFocused ? "text-cyan-400" : "text-slate-400"
              }`}
            >
              {icon}
            </div>
          )}

          {/* Floating Label & Input Field Container */}
          <div className="relative flex-1 flex flex-col justify-center h-full py-1">
            <motion.label
              initial={false}
              animate={{
                y: isFloating ? -8 : 0,
                scale: isFloating ? 0.72 : 1,
                color: error
                  ? "#f87171"
                  : isFocused
                  ? themeColor
                  : "#94a3b8",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute left-0 pointer-events-none origin-top-left font-medium text-xs tracking-wide"
            >
              {label}
            </motion.label>

            <input
              ref={ref}
              type={type}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={`w-full bg-transparent text-white text-xs font-sans focus:outline-none pt-2.5 transition-opacity ${
                isFloating ? "opacity-100" : "opacity-0"
              } ${className}`}
              {...props}
            />
          </div>

          {/* Right Status Indicators & Elements */}
          <div className="flex items-center gap-1.5 ml-2">
            <AnimatePresence mode="wait">
              {isValid && !error && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                </motion.div>
              )}
            </AnimatePresence>

            {rightElement}
          </div>
        </div>

        {/* Inline Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -2, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -2, height: 0 }}
              className="text-[11px] text-rose-400 px-1 font-mono font-medium flex items-center gap-1"
            >
              <span>•</span> {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";
