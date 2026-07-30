import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { z } from "zod";

const runAnalysisSchema = z.object({
  type: z.enum(["DETECTION", "OCR", "TRANSCRIPTION", "TRACKING", "RECONSTRUCTION"]),
});

export async function POST(request: NextRequest, context: { params: Promise<{ evidenceId: string }> }) {
  try {
    const { evidenceId } = await context.params;
    const evidence = store.findEvidenceById(evidenceId);
    
    if (!evidence) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = runAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // In a real app, this would queue a job via BullMQ to the Python AI engine.
    // For this simple Next.js app, we just simulate success.
    
    store.updateEvidenceStatus(evidenceId, "PROCESSING");
    
    // Simulate async processing...
    setTimeout(() => {
      store.updateEvidenceStatus(evidenceId, "READY");
      store.aiResults.push({
        id: crypto.randomUUID(),
        evidenceId,
        type: parsed.data.type,
        model: "SimulationModel",
        modelVersion: "1.0",
        confidence: 0.95,
        occurredAt: new Date().toISOString(),
        payload: { summary: `Simulated ${parsed.data.type} analysis complete.` },
        createdAt: new Date().toISOString(),
      });
    }, 2000);

    store.recordAudit({
      actorId: "dev-investigator",
      action: "ANALYSIS_QUEUED",
      resourceType: "Evidence",
      resourceId: evidenceId,
      caseId: evidence.caseId,
      details: { type: parsed.data.type },
    });

    return NextResponse.json({ data: { message: "Analysis queued successfully" } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to queue analysis" }, { status: 500 });
  }
}
