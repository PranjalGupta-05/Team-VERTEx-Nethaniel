"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout?: () => void;
}) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Topbar onLogout={onLogout} />
        {children}
      </main>
    </div>
  );
}
