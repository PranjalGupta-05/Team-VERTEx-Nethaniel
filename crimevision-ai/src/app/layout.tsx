import type { Metadata } from "next";
import "./globals.css";
import { ApiProvider } from "@/lib/api-provider";

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
          {children}
        </ApiProvider>
      </body>
    </html>
  );
}
