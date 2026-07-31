"use client";

import React, { useState } from "react";
import { AuthContainer } from "@/components/auth/auth-container";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { SplashScreen } from "@/components/splash/splash-screen";
import { AppShell } from "@/components/shell/app-shell";
import { AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [view, setView] = useState<"splash" | "auth" | "dashboard">("splash");

  const handleLogout = () => {
    setView("auth");
  };

  return (
    <>
      {/* Splashscreen — full screen, no shell */}
      <AnimatePresence mode="wait">
        {view === "splash" && (
          <SplashScreen key="splash" onComplete={() => setView("auth")} />
        )}
      </AnimatePresence>

      {/* Auth Pages — clean full screen, no top switcher bar */}
      {view === "auth" && (
        <AuthContainer onAuthenticated={() => setView("dashboard")} />
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
