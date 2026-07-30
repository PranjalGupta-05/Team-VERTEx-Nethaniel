import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { z } from "zod";

const querySchema = z.object({
  caseId: z.string().uuid(),
  query: z.string().min(3).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = querySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { caseId, query } = parsed.data;
    
    // Verify case exists
    const caseData = store.findCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const result = store.chatAnswer(caseId, query);

    store.recordAudit({
      actorId: "dev-investigator",
      action: "CHAT_QUERY",
      resourceType: "Case",
      resourceId: caseId,
      caseId: caseId,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}
