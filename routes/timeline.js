const { Router } = require("express");
const db = require("../db");

const router = Router();

// Get timeline events for a case
router.get("/:caseId", (req, res) => {
  const caseExists = db.prepare("SELECT id FROM cases WHERE id = ?").get(req.params.caseId);
  if (!caseExists) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Case not found." } });
  }

  const results = db.prepare(`
    SELECT ar.*, e.original_name, e.captured_at as evidence_captured_at, e.created_at as evidence_created_at
    FROM ai_results ar
    JOIN evidence e ON ar.evidence_id = e.id
    WHERE e.case_id = ?
    ORDER BY COALESCE(ar.occurred_at, e.captured_at, e.created_at) ASC, ar.created_at ASC
  `).all(req.params.caseId);

  const events = results.map((r) => {
    let payload = {};
    try { payload = JSON.parse(r.payload || "{}"); } catch (e) {}

    const label = payload.label || payload.text || r.type.toLowerCase();
    const description = payload.text || payload.summary || `${label} identified by ${r.model}.`;

    return {
      id: r.id,
      evidenceId: r.evidence_id,
      evidenceName: r.original_name,
      type: r.type,
      title: label.replace(/\b\w/g, (c) => c.toUpperCase()),
      description,
      confidence: r.confidence,
      occurredAt: r.occurred_at || r.evidence_captured_at || r.evidence_created_at,
      payload
    };
  });

  res.json({ data: events });
});

module.exports = router;
