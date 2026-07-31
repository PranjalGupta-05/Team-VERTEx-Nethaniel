import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await context.params;
    const report = await store.generateFullReport(caseId);
    if (!report) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    await store.recordAudit({
      actorId: "dev-investigator",
      action: "FULL_REPORT_EXPORTED",
      resourceType: "Case",
      resourceId: caseId,
      caseId: caseId,
      details: { format: "JSON" },
    });

    const body = JSON.stringify(report, null, 2);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${report.case.reference}-report.json"`,
      },
    });
  } catch (error) {
    console.error("Full report generation failed:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
