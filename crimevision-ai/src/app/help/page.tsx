import type { Metadata } from "next";
import { HelpView } from "@/components/help/help-view";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Forensic knowledge base, system diagnostics and support ticket center.",
};

export default function HelpPage() {
  return <HelpView />;
}
