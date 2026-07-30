import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await context.params;
    const caseData = store.findCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const auditLogs = store.listAuditForCase(caseId);
    return NextResponse.json({ data: auditLogs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
