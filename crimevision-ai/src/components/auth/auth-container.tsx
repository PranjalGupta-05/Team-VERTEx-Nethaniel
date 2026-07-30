"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Shield, Palette, Check } from "lucide-react";
import { CinematicBackground, ThemePreset } from "./cinematic-background";
import { FloatingGlassOrnaments } from "./floating-glass-ornaments";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { ForgotPasswordForm } from "./forgot-password-form";
import { AuthSuccessOverlay } from "./auth-success-overlay";
import { sounds } from "@/lib/sound-effects";

interface AuthContainerProps {
  onAuthenticated?: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthenticated }) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");
  const [theme, setTheme] = useState<ThemePreset>("obsidian");
  const [isMuted, setIsMuted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const getThemeColor = (t: ThemePreset) => {
    switch (t) {
      case "violet":
        return "#c084fc";
      case "cyan":
        return "#22d3ee";
      case "emerald":
        return "#34d399";
      case "obsidian":
      default:
        return "#54e7da";
    }
  };

  const currentThemeColor = getThemeColor(theme);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleTabChange = (tab: "login" | "signup" | "forgot") => {
    sounds.playFocus();
    setActiveTab(tab);
  };

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  const handleAuthComplete = () => {
    setIsSuccess(false);
    if (onAuthenticated) {
      onAuthenticated();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="relative h-screen max-h-screen w-full flex flex-col items-center justify-between p-3 overflow-hidden font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* Background Particle & Light System */}
      <CinematicBackground theme={theme} />

      {/* Floating Parallax Glass Badges */}
      <FloatingGlassOrnaments />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between py-1 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900/90 border border-white/20 flex items-center justify-center shadow-lg shadow-cyan-950/40">
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wider font-mono">
              VERTEX<span className="text-cyan-400">ID</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
              Zero-Trust Auth Suite
            </p>
          </div>
        </div>

        {/* Right Controls: Sound Toggle & Theme Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900/70 border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-all backdrop-blur-md"
            title={isMuted ? "Unmute sound synthesis" : "Mute sound synthesis"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white hover:border-white/25 transition-all backdrop-blur-md"
            >
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span className="capitalize hidden sm:inline">{theme}</span>
            </button>

            <AnimatePresence>
              {showThemePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-40 bg-slate-900/95 border border-white/15 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl z-30 space-y-1"
                >
                  <div className="text-[9px] uppercase font-mono font-bold text-slate-500 px-2 py-0.5">
                    Theme Presets
                  </div>
                  {(["obsidian", "violet", "cyan", "emerald"] as ThemePreset[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t);
                        setShowThemePicker(false);
                        sounds.playFocus();
                      }}
                      className={`flex items-center justify-between w-full px-2 py-1 rounded-lg text-xs font-mono capitalize transition-colors ${
                        theme === t
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getThemeColor(t) }}
                        />
                        <span>{t}</span>
                      </div>
                      {theme === t && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="relative z-10 my-auto w-full max-w-[420px] shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="relative bg-slate-950/80 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden"
        >
          {/* Top Specular Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* Tab Switcher */}
          {activeTab !== "forgot" && (
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 mb-3.5">
              <button
                onClick={() => handleTabChange("login")}
                className={`relative flex-1 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors ${
                  activeTab === "login" ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {activeTab === "login" && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-slate-800/90 border border-white/10 rounded-lg shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                onClick={() => handleTabChange("signup")}
                className={`relative flex-1 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors ${
                  activeTab === "signup" ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {activeTab === "signup" && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-slate-800/90 border border-white/10 rounded-lg shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Sign Up</span>
              </button>
            </div>
          )}

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {activeTab === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
              >
                <LoginForm
                  onSuccess={handleSuccess}
                  onForgotPassword={() => handleTabChange("forgot")}
                  onSwitchToSignup={() => handleTabChange("signup")}
                  themeColor={currentThemeColor}
                />
              </motion.div>
            )}

            {activeTab === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                <SignupForm
                  onSuccess={handleSuccess}
                  onSwitchToLogin={() => handleTabChange("login")}
                  themeColor={currentThemeColor}
                />
              </motion.div>
            )}

            {activeTab === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18 }}
              >
                <ForgotPasswordForm
                  onBackToLogin={() => handleTabChange("login")}
                  themeColor={currentThemeColor}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full max-w-md flex items-center justify-between text-[10px] font-mono text-slate-500 py-1 shrink-0">
        <span>© 2026 VERTEX Labs</span>
        <div className="flex items-center gap-2.5">
          <a href="#privacy" className="hover:text-slate-300 transition-colors">
            Privacy
          </a>
          <span>•</span>
          <a href="#terms" className="hover:text-slate-300 transition-colors">
            Terms
          </a>
          <span>•</span>
          <a href="#security" className="hover:text-slate-300 transition-colors">
            Security
          </a>
        </div>
      </footer>

      {/* Success Celebration Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <AuthSuccessOverlay
            userName={activeTab === "signup" ? "New Investigator" : "Commander"}
            onComplete={handleAuthComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
