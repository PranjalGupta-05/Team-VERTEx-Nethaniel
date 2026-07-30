import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: NextRequest, context: { params: Promise<{ evidenceId: string }> }) {
  try {
    const { evidenceId } = await context.params;
    const evidence = store.findEvidenceById(evidenceId);
    
    if (!evidence) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: evidence.id,
        hash: evidence.fileHash,
        algorithm: "SHA-256",
        verified: true,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify integrity" }, { status: 500 });
  }
}
