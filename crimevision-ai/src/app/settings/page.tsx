import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure investigator profile, AI detection models, and system preferences.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
