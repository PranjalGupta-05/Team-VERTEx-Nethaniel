import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { generatePdf } from "@/lib/pdf-generator";
import type { ReportData } from "@/lib/pdf-generator";

export async function POST(request: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await context.params;
    const report = await store.generateFullReport(caseId);
    if (!report) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    await store.recordAudit({
      actorId: "dev-investigator",
      action: "PDF_REPORT_EXPORTED",
      resourceType: "Case",
      resourceId: caseId,
      caseId: caseId,
      details: { format: "PDF" },
    });

    const pdfBuffer = generatePdf(report as ReportData);
    const body = new Uint8Array(pdfBuffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${report.case.reference}-report.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("PDF report generation failed:", error);
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 });
  }
}
