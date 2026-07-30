"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, Cpu, Lock, Terminal } from "lucide-react";

export const FloatingGlassOrnaments: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setMousePos({
        x: (e.clientX - centerX) / centerX,
        y: (e.clientY - centerY) / centerY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden lg:block">
      {/* Top Left Floating Security Badge */}
      <motion.div
        animate={{
          x: mousePos.x * -25,
          y: mousePos.y * -25,
          rotate: [0, 2, 0, -2, 0],
        }}
        transition={{
          x: { type: "spring", stiffness: 100, damping: 20 },
          y: { type: "spring", stiffness: 100, damping: 20 },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute top-20 left-16 p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-slate-200 tracking-wider">
            NEXUS PROTOCOL v4.8
          </div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>256-Bit Quantum Encrypted</span>
          </div>
        </div>
      </motion.div>

      {/* Top Right Floating Tech Chip */}
      <motion.div
        animate={{
          x: mousePos.x * 30,
          y: mousePos.y * 30,
          rotate: [0, -3, 0, 3, 0],
        }}
        transition={{
          x: { type: "spring", stiffness: 100, damping: 20 },
          y: { type: "spring", stiffness: 100, damping: 20 },
          rotate: { duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute top-28 right-20 p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-slate-200">
            AI BIOMETRIC VERIFIER
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Latency: 0.8ms
          </div>
        </div>
      </motion.div>

      {/* Bottom Left Floating Terminal Badge */}
      <motion.div
        animate={{
          x: mousePos.x * -35,
          y: mousePos.y * -35,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="absolute bottom-24 left-24 p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
          <Terminal className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-slate-200">
            ZERO-TRUST HANDSHAKE
          </div>
          <div className="text-[10px] text-cyan-400 font-mono">
            Passkey / WebAuthn Ready
          </div>
        </div>
      </motion.div>

      {/* Bottom Right Floating Sparkle Tag */}
      <motion.div
        animate={{
          x: mousePos.x * 20,
          y: mousePos.y * 20,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="absolute bottom-20 right-28 p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-2.5"
      >
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-mono text-slate-300 font-semibold">
          Award-Winning UX
        </span>
      </motion.div>
    </div>
  );
};
