const { Router } = require("express");
const crypto = require("crypto");
const db = require("../db");

const router = Router();

// Run analysis on evidence (mocked)
router.post("/evidence/:evidenceId/run", (req, res) => {
  const evidence = db.prepare("SELECT * FROM evidence WHERE id = ?").get(req.params.evidenceId);
  if (!evidence) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Evidence not found." } });
  }

  // Update status to PROCESSING
  db.prepare("UPDATE evidence SET status = 'PROCESSING', updated_at = datetime('now') WHERE id = ?").run(evidence.id);

  // Delete old results and create mock results
  const runAnalysis = db.transaction(() => {
    db.prepare("DELETE FROM ai_results WHERE evidence_id = ?").run(evidence.id);

    // Generate mock AI results based on modality
    const results = [];

    if (evidence.modality === "IMAGE" || evidence.modality === "VIDEO" || evidence.modality === "CCTV" || evidence.modality === "BODYCAM" || evidence.modality === "DRONE") {
      results.push({
        type: "DETECTION",
        model: "crimevision-detect-v2",
        modelVersion: "2.1.0",
        confidence: 0.94,
        payload: JSON.stringify({ label: "Person detected", bbox: [120, 80, 340, 450], class: "person" })
      });
    }

    if (evidence.modality === "IMAGE" || evidence.modality === "DOCUMENT") {
      results.push({
        type: "OCR",
        model: "crimevision-ocr-v1",
        modelVersion: "1.3.0",
        confidence: 0.97,
        payload: JSON.stringify({ text: "Sample extracted text from evidence document", language: "en" })
      });
    }

    if (evidence.modality === "AUDIO" || evidence.modality === "VIDEO") {
      results.push({
        type: "TRANSCRIPTION",
        model: "crimevision-whisper-v1",
        modelVersion: "1.0.0",
        confidence: 0.89,
        payload: JSON.stringify({ text: "Transcribed audio content from evidence", language: "en", duration_seconds: 45 })
      });
    }

    // Always add at least one detection
    if (results.length === 0) {
      results.push({
        type: "DETECTION",
        model: "crimevision-generic-v1",
        modelVersion: "1.0.0",
        confidence: 0.85,
        payload: JSON.stringify({ label: "Evidence processed", summary: "Analysis complete" })
      });
    }

    for (const r of results) {
      db.prepare(`
        INSERT INTO ai_results (id, evidence_id, type, model, model_version, confidence, occurred_at, payload)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), evidence.id, r.type, r.model, r.modelVersion, r.confidence, evidence.captured_at || new Date().toISOString(), r.payload);
    }

    db.prepare("UPDATE evidence SET status = 'READY', updated_at = datetime('now') WHERE id = ?").run(evidence.id);
  });

  try {
    runAnalysis();

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, case_id, actor_id, action, resource_type, resource_id, details)
      VALUES (?, ?, ?, 'ANALYSIS_COMPLETED', 'Evidence', ?, ?)
    `).run(crypto.randomUUID(), evidence.case_id, req.actor.id, evidence.id, JSON.stringify({ status: "READY" }));

    res.json({ data: { evidenceId: evidence.id, status: "READY" } });
  } catch (err) {
    db.prepare("UPDATE evidence SET status = 'FAILED', updated_at = datetime('now') WHERE id = ?").run(evidence.id);
    throw err;
  }
});

module.exports = router;
