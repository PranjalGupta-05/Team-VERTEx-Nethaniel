import { AppShell } from "@/components/shell/app-shell";
export default function helpLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
