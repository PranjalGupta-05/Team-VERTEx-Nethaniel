"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { sounds } from "@/lib/sound-effects";
import { RotateCw } from "lucide-react";

interface OTPInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  themeColor?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  themeColor = "#54e7da",
}) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(45);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (char && !/^[0-9]$/.test(char)) return;

    sounds.playKeystroke();
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto advance focus
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join("");
    if (fullCode.length === length && !newDigits.includes("")) {
      sounds.playSuccess();
      if (onComplete) onComplete(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d+$/.test(pasteData)) {
      const pasteDigits = pasteData.slice(0, length).split("");
      const newDigits = Array(length).fill("");
      pasteDigits.forEach((d, idx) => {
        newDigits[idx] = d;
      });
      setDigits(newDigits);
      sounds.playSuccess();
      const fullCode = newDigits.join("");
      if (fullCode.length === length && !newDigits.includes("") && onComplete) {
        onComplete(fullCode);
      }
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setDigits(Array(length).fill(""));
    setResendTimer(45);
    inputRefs.current[0]?.focus();
    sounds.playFocus();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full my-2">
      <div className="flex items-center gap-2 sm:gap-3">
        {digits.map((digit, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileFocus={{ scale: 1.08 }}
            className="relative"
          >
            <input
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold rounded-xl border transition-all duration-300 focus:outline-none ${
                digit
                  ? "bg-slate-900 border-cyan-400 text-white shadow-[0_0_20px_rgba(84,231,218,0.2)]"
                  : "bg-slate-950/60 border-white/10 text-slate-400 focus:border-cyan-400 focus:bg-slate-900/80"
              }`}
            />
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between w-full text-xs font-mono px-1">
        <span className="text-slate-400">Didn't receive verification code?</span>
        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className={`flex items-center gap-1 font-semibold transition-colors ${
            resendTimer > 0
              ? "text-slate-600 cursor-not-allowed"
              : "text-cyan-400 hover:text-cyan-300"
          }`}
        >
          <RotateCw className={`w-3 h-3 ${resendTimer === 0 ? "animate-spin-slow" : ""}`} />
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};
