"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface InteractiveEyeProps {
  isPasswordVisible?: boolean;
  isPasswordFocused?: boolean;
  passwordLength?: number;
  isSuccess?: boolean;
  hasError?: boolean;
  themeColor?: string;
}

export const InteractiveEye: React.FC<InteractiveEyeProps> = ({
  isPasswordVisible = false,
  isPasswordFocused = false,
  passwordLength = 0,
  isSuccess = false,
  hasError = false,
  themeColor = "#54e7da",
}) => {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.hypot(dx, dy), 120);

      // Map distance to pupil offset inside eye socket (max 7px)
      const maxOffset = 7;
      const normalizedDist = (distance / 120) * maxOffset;

      setPupilPos({
        x: Math.cos(angle) * normalizedDist,
        y: Math.sin(angle) * normalizedDist,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blink interval loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.4 && !isPasswordFocused) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180);
      }
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, [isPasswordFocused]);

  // Derived state for eyelids
  const eyeHeight = isBlinking
    ? 2
    : isPasswordFocused && !isPasswordVisible
    ? 4 // Peeking squint
    : isPasswordVisible
    ? 24 // Wide open
    : hasError
    ? 6 // Disappointed squint
    : 18; // Default open

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center gap-3 py-2 select-none"
    >
      {/* Glow aura behind avatar */}
      <div
        className="absolute w-28 h-12 blur-xl rounded-full opacity-40 transition-all duration-500"
        style={{
          backgroundColor: hasError
            ? "#ef4444"
            : isSuccess
            ? "#10b981"
            : themeColor,
        }}
      />

      {/* Mascot face container */}
      <div className="relative flex items-center justify-center gap-4 bg-slate-950/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl">
        {/* Left Eye */}
        <div className="relative flex items-center justify-center w-9 h-9 bg-slate-900 rounded-full border border-white/20 overflow-hidden shadow-inner">
          <motion.div
            animate={{
              height: eyeHeight,
              scaleY: isBlinking ? 0.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full flex items-center justify-center"
          >
            {/* Pupil */}
            <motion.div
              animate={{
                x: pupilPos.x,
                y: pupilPos.y,
                scale: isPasswordVisible ? 1.25 : passwordLength > 0 ? 0.9 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: hasError
                  ? "#f87171"
                  : isSuccess
                  ? "#34d399"
                  : themeColor,
              }}
            >
              {/* Eye Catchlight Reflection */}
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
              <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-white rounded-full opacity-50" />
            </motion.div>
          </motion.div>
        </div>

        {/* Center Mascot Badge Indicator */}
        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              scale: isSuccess ? [1, 1.2, 1] : 1,
              rotate: hasError ? [-5, 5, -5, 0] : 0,
            }}
            className="w-2.5 h-2.5 rounded-full shadow-md"
            style={{
              backgroundColor: hasError
                ? "#ef4444"
                : isSuccess
                ? "#10b981"
                : isPasswordVisible
                ? "#3b82f6"
                : themeColor,
            }}
          />
        </div>

        {/* Right Eye */}
        <div className="relative flex items-center justify-center w-9 h-9 bg-slate-900 rounded-full border border-white/20 overflow-hidden shadow-inner">
          <motion.div
            animate={{
              height: eyeHeight,
              scaleY: isBlinking ? 0.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full flex items-center justify-center"
          >
            {/* Pupil */}
            <motion.div
              animate={{
                x: pupilPos.x,
                y: pupilPos.y,
                scale: isPasswordVisible ? 1.25 : passwordLength > 0 ? 0.9 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: hasError
                  ? "#f87171"
                  : isSuccess
                  ? "#34d399"
                  : themeColor,
              }}
            >
              {/* Eye Catchlight Reflection */}
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
              <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-white rounded-full opacity-50" />
            </motion.div>
          </motion.div>
        </div>

        {/* Hands / Shield overlay when hiding password */}
        {isPasswordFocused && !isPasswordVisible && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute inset-0 bg-slate-950/90 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md"
          >
            <span className="text-[10px] uppercase tracking-widest font-mono font-semibold text-slate-400">
              [ Protected Mode ]
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
