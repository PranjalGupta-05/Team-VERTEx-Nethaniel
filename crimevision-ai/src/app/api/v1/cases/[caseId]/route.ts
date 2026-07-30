import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { z } from "zod";

const updateCaseSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  status: z.enum(["OPEN", "PROCESSING", "REVIEW", "CLOSED"]).optional(),
});

export async function GET(request: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await context.params;
    const caseData = store.findCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    store.recordAudit({
      actorId: "dev-investigator",
      action: "CASE_VIEWED",
      resourceType: "Case",
      resourceId: caseId,
      caseId: caseId,
    });

    return NextResponse.json({ data: caseData });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();
    const parsed = updateCaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { title, description, location, occurredAt, priority, status } = parsed.data;
    const updateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(occurredAt !== undefined && { occurredAt }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
    };
    const updatedCase = store.updateCase(caseId, updateData);
    if (!updatedCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    store.recordAudit({
      actorId: "dev-investigator",
      action: "CASE_UPDATED",
      resourceType: "Case",
      resourceId: caseId,
      caseId: caseId,
      details: { changes: parsed.data },
    });

    return NextResponse.json({ data: updatedCase });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}
