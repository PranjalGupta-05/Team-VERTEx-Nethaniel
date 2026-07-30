import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/ui/module-placeholder";
export default function SettingsPage() {
  return <ModulePlaceholder eyebrow="Administration" title="System controls" description="Configure identity, storage, model adapters, retention, and alerting." icon={Settings} />;
}
