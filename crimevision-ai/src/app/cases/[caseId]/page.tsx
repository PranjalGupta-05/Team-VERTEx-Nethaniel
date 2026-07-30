import type { Metadata } from "next";
import { CaseWorkspace } from "@/components/case/case-workspace";

export const metadata: Metadata = { title: "Case workspace" };

export default async function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return <CaseWorkspace caseId={caseId} />;
}
