import { AppShell } from "@/components/shell/app-shell";
export default function auditLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
