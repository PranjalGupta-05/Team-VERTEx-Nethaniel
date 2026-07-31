import type { Metadata } from "next";
import { ReportsIndex } from "@/components/reports/reports-index";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return <ReportsIndex />;
}
