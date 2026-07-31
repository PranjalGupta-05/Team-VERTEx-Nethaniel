"use client";

import React, { useState, useEffect } from "react";
import { AuthContainer } from "@/components/auth/auth-container";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { SplashScreen } from "@/components/splash/splash-screen";
import { AppShell } from "@/components/shell/app-shell";
import { AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [view, setView] = useState<"splash" | "auth" | "dashboard">("splash");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("auth_user_email");
      const storedAuth = localStorage.getItem("crimevision_authenticated");
      const splashSeen = sessionStorage.getItem("splash_seen");

      if (storedEmail || storedAuth === "true") {
        setView("dashboard");
      } else if (splashSeen === "true") {
        setView("auth");
      }
    }
  }, []);

  const handleSplashComplete = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("splash_seen", "true");
    }
    setView("auth");
  };

  const handleAuthenticated = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("crimevision_authenticated", "true");
    }
    setView("dashboard");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user_email");
      localStorage.removeItem("auth_user_name");
      localStorage.removeItem("crimevision_authenticated");
      sessionStorage.removeItem("splash_seen");
    }
    setView("auth");
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#090c0e]" />;
  }

  return (
    <>
      {/* Splashscreen — full screen, no shell */}
      <AnimatePresence mode="wait">
        {view === "splash" && (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {/* Auth Pages — clean full screen, no top switcher bar */}
      {view === "auth" && (
        <AuthContainer onAuthenticated={handleAuthenticated} />
      )}

      {/* Dashboard — wrapped in AppShell with topbar user dropdown */}
      {view === "dashboard" && (
        <AppShell onLogout={handleLogout}>
          <DashboardView />
        </AppShell>
      )}
    </>
  );
}
