"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

interface MagneticButtonProps {
  children: React.ReactNode;
  isLoading?: boolean | undefined;
  isSuccess?: boolean | undefined;
  variant?: "primary" | "secondary" | "ghost" | undefined;
  themeColor?: string | undefined;
  onClick?: ((e: React.MouseEvent<HTMLButtonElement>) => void) | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
  type?: "button" | "submit" | "reset" | undefined;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  isLoading = false,
  isSuccess = false,
  variant = "primary",
  themeColor = "#54e7da",
  onClick,
  disabled,
  className = "",
  type = "button",
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled || isLoading) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const pullX = (e.clientX - centerX) * 0.2;
    const pullY = (e.clientY - centerY) * 0.2;

    setPosition({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    sounds.playKeystroke();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRipples((prev) => [...prev, { x, y, id: Date.now() }]);
    }

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      whileTap={{ scale: 0.96 }}
      disabled={disabled || isLoading || isSuccess}
      className={`relative overflow-hidden group flex items-center justify-center min-h-[44px] w-full px-5 rounded-xl font-semibold text-xs tracking-wide transition-all duration-300 ${
        variant === "primary"
          ? "bg-slate-900 text-white border border-white/20 shadow-lg shadow-cyan-950/20 hover:border-cyan-400/80 hover:shadow-[0_0_20px_rgba(84,231,218,0.25)]"
          : variant === "secondary"
          ? "bg-slate-950/60 text-slate-200 border border-white/10 hover:border-white/30 hover:bg-slate-900/80"
          : "bg-transparent text-slate-400 hover:text-white"
      } ${className}`}
    >
      {/* Specular Light Sweep Animation */}
      {variant === "primary" && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      )}

      {/* Background Gradient Glow Fill */}
      {variant === "primary" && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
          style={{
            background: `radial-gradient(circle at center, ${themeColor}1a 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Ripple Elements */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={() =>
            setRipples((prev) => prev.filter((item) => item.id !== r.id))
          }
          className="absolute w-12 h-12 bg-white/30 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Authenticating...</span>
          </>
        ) : isSuccess ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            <span className="text-emerald-400">Granted</span>
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};
