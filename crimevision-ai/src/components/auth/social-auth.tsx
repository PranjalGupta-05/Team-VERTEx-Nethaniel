"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Globe, Loader2, ShieldCheck, X } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

interface SocialAuthProps {
  onSuccess?: (provider: string) => void;
}

export const SocialAuth: React.FC<SocialAuthProps> = ({ onSuccess }) => {
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [authStep, setAuthStep] = useState<"connecting" | "success">("connecting");

  const providers = [
    {
      id: "google",
      name: "Google",
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9c-.3-.7-.5-1.6-.5-2.5z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
          />
        </svg>
      ),
    },
    {
      id: "github",
      name: "GitHub",
      icon: <Github className="w-3.5 h-3.5 text-white" />,
    },
    {
      id: "apple",
      name: "Apple",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 170 170">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.07-3.48-2.76-7.39-7.46-11.75-14.1-6.19-9.4-11.01-19.8-14.46-31.21-3.46-11.41-5.19-22.18-5.19-32.31 0-14.28 3.57-25.79 10.71-34.52 7.14-8.73 16.03-13.19 26.68-13.39 4.79 0 10.02 1.25 15.68 3.75 5.66 2.5 9.77 3.75 12.33 3.75 2.11 0 6.23-1.25 12.36-3.75 6.13-2.5 11.33-3.71 15.6-3.64 10.37.53 19 4.41 25.89 11.64-9.35 5.66-13.91 13.54-13.68 23.64.23 8.1 3.26 14.86 9.09 20.28 5.83 5.42 12.87 8.35 21.12 8.79-1.9 5.85-4.41 12.1-7.53 18.75zM119.22 31.06c0-7.34 2.65-14.26 7.95-20.76 5.3-6.5 11.85-10.3 19.65-11.4.23 1.07.35 2.07.35 3 0 7.23-2.77 14.3-8.31 21.2-5.54 6.9-12.21 10.74-20.01 11.52-.12-.85-.18-1.92-.18-3.21z" />
        </svg>
      ),
    },
    {
      id: "sso",
      name: "SSO",
      icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />,
    },
  ];

  const handleProviderClick = (provider: typeof providers[0]) => {
    sounds.playFocus();
    setActiveProvider(provider.name);
    setShowModal(true);
    setAuthStep("connecting");

    setTimeout(() => {
      setAuthStep("success");
      sounds.playSuccess();
      setTimeout(() => {
        setShowModal(false);
        if (onSuccess) onSuccess(provider.name);
      }, 1200);
    }, 1800);
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-2 w-full">
        {providers.map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleProviderClick(p)}
            className="flex items-center justify-center h-9 rounded-xl bg-slate-950/60 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-900/80 transition-all shadow-sm group"
            title={`Continue with ${p.name}`}
          >
            <div className="transition-transform group-hover:scale-110">
              {p.icon}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-slate-900 border border-white/15 rounded-2xl p-5 shadow-2xl space-y-4 text-center"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center shadow-lg">
                  {authStep === "connecting" ? (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {authStep === "connecting"
                      ? `Connecting to ${activeProvider}...`
                      : `Authenticated with ${activeProvider}`}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {authStep === "connecting"
                      ? "Verifying secure handshake tokens..."
                      : "Redirecting to workspace."}
                  </p>
                </div>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  initial={{ width: "0%" }}
                  animate={{ width: authStep === "connecting" ? "70%" : "100%" }}
                  transition={{ duration: 1.5 }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
