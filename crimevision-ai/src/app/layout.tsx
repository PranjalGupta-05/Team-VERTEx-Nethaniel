import type { Metadata } from "next";
import "./globals.css";
import { ApiProvider } from "@/lib/api-provider";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export const metadata: Metadata = {
  title: {
    default: "CrimeVision AI",
    template: "%s · CrimeVision AI"
  },
  description: "Forensic intelligence and digital crime-scene reconstruction platform.",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ApiProvider>
          <div className="app-shell">
            <Sidebar />
            <main className="app-main">
              <Topbar />
              {children}
            </main>
          </div>
        </ApiProvider>
      </body>
    </html>
  );
}
