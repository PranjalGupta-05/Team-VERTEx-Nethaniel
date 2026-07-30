const { Router } = require("express");
const crypto = require("crypto");
const db = require("../db");

const router = Router();

// Generate case manifest report
router.post("/cases/:caseId/manifest", (req, res) => {
  const caseRecord = db.prepare(`
    SELECT c.*, u.display_name as owner_name, u.email as owner_email
    FROM cases c LEFT JOIN users u ON c.owner_id = u.id
    WHERE c.id = ?
  `).get(req.params.caseId);

  if (!caseRecord) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Case not found." } });
  }

  const evidenceList = db.prepare(`
    SELECT e.*, (SELECT COUNT(*) FROM ai_results WHERE evidence_id = e.id) as analysis_count
    FROM evidence e WHERE e.case_id = ? ORDER BY e.created_at ASC
  `).all(req.params.caseId);

  const auditCount = db.prepare("SELECT COUNT(*) as count FROM audit_logs WHERE case_id = ?").get(req.params.caseId).count;

  const generatedAt = new Date().toISOString();
  const evidence = evidenceList.map((e) => ({
    id: e.id,
    originalName: e.original_name,
    sha256: e.file_hash,
    mimeType: e.mime_type,
    byteSize: String(e.byte_size),
    status: e.status,
    analysisCount: e.analysis_count
  }));

  const canonical = JSON.stringify({ caseId: req.params.caseId, reference: caseRecord.reference, generatedAt, evidence });
  const certificationHash = crypto.createHash("sha256").update(canonical).digest("hex");

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (id, case_id, actor_id, action, resource_type, resource_id, details)
    VALUES (?, ?, ?, 'REPORT_EXPORTED', 'Case', ?, ?)
  `).run(crypto.randomUUID(), req.params.caseId, req.actor.id, req.params.caseId, JSON.stringify({ certificationHash }));

  const report = {
    reportVersion: "1.0",
    generatedAt,
    certification: {
      algorithm: "SHA-256",
      hash: certificationHash,
      statement: "This manifest cryptographically binds the listed evidence integrity hashes."
    },
    case: {
      id: caseRecord.id,
      reference: caseRecord.reference,
      title: caseRecord.title,
      description: caseRecord.description,
      status: caseRecord.status,
      owner: { id: caseRecord.owner_id, displayName: caseRecord.owner_name, email: caseRecord.owner_email }
    },
    evidence,
    chainOfCustodyEvents: auditCount
  };

  res.setHeader("content-disposition", `attachment; filename="${caseRecord.reference}-manifest.json"`);
  res.json(report);
});

module.exports = router;
