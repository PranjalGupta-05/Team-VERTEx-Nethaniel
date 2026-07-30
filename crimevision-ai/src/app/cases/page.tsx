import type { Metadata } from "next";
import { CasesIndex } from "@/components/cases/cases-index";

export const metadata: Metadata = { title: "Cases" };

export default function CasesPage() {
  return <CasesIndex />;
}
