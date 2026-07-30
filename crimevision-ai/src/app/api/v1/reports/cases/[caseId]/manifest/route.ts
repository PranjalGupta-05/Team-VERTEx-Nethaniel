import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest, context: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await context.params;
    const manifest = store.createManifest(caseId);
    if (!manifest) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    store.recordAudit({
      actorId: "dev-investigator",
      action: "MANIFEST_EXPORTED",
      resourceType: "Case",
      resourceId: caseId,
      caseId: caseId,
    });

    return NextResponse.json(manifest); // Note: frontend expects raw manifest, not wrapped in {data: ...}
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate manifest" }, { status: 500 });
  }
}
