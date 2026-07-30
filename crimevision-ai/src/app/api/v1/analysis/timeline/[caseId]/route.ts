import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await context.params;
    const caseData = store.findCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const timeline = store.timelineForCase(caseId);
    return NextResponse.json({ data: timeline });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 });
  }
}
