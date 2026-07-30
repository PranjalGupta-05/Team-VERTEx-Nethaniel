import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { randomUUID, createHash } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const caseId = formData.get("caseId") as string;
    const file = formData.get("file") as File;

    if (!caseId || !file) {
      return NextResponse.json({ error: "Missing caseId or file" }, { status: 400 });
    }

    const caseData = await store.findCaseById(caseId);
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = createHash("sha256").update(buffer).digest("hex");
    
    // Create storage dir
    const storageDir = join(process.cwd(), "storage", "cases", caseId);
    if (!existsSync(storageDir)) {
      await mkdir(storageDir, { recursive: true });
    }
    
    const evidenceId = randomUUID();
    const storageKey = join("cases", caseId, `${evidenceId}-${file.name}`);
    const filePath = join(process.cwd(), "storage", storageKey);
    
    await writeFile(filePath, buffer);

    let modality = "UNKNOWN";
    if (file.type.startsWith("image/")) modality = "PHOTO";
    else if (file.type.startsWith("video/")) modality = "VIDEO";
    else if (file.type.startsWith("audio/")) modality = "AUDIO";

    const evidence = await store.createEvidence({
      id: evidenceId,
      caseId,
      originalName: file.name,
      storageKey,
      fileHash,
      byteSize: file.size.toString(),
      mimeType: file.type,
      modality,
      metadata: { source: "manual-upload" },
      status: "READY",
      capturedAt: new Date().toISOString(),
    });

    await store.recordAudit({
      actorId: "dev-investigator",
      action: "EVIDENCE_UPLOADED",
      resourceType: "Evidence",
      resourceId: evidenceId,
      caseId,
      details: { fileHash },
    });

    return NextResponse.json({ data: evidence }, { status: 201 });
  } catch (error) {
    console.error("Upload error", error);
    return NextResponse.json({ error: "Failed to upload evidence" }, { status: 500 });
  }
}
