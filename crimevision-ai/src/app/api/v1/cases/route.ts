import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { z } from "zod";

const createCaseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  location: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  priority: z.number().int().min(1).max(5).default(3),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status") as any;

    const filters: { search?: string; status?: any } = {};
    if (search !== null) filters.search = search;
    if (status !== null) filters.status = status;

    const cases = await store.listCases(filters);
    return NextResponse.json({ data: cases });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const newCase = await store.createCase({
      title: parsed.data.title,
      ownerId: "dev-investigator", // Hardcoded for simplified version
      priority: parsed.data.priority,
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.location !== undefined && { location: parsed.data.location }),
      ...(parsed.data.occurredAt !== undefined && { occurredAt: parsed.data.occurredAt }),
    });

    await store.recordAudit({
      actorId: "dev-investigator",
      action: "CASE_CREATED",
      resourceType: "Case",
      resourceId: newCase.id,
      caseId: newCase.id,
    });

    return NextResponse.json({ data: newCase }, { status: 201 });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json({ error: "Failed to create case", details: String(error) }, { status: 500 });
  }
}
