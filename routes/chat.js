const { Router } = require("express");
const db = require("../db");

const router = Router();

// Investigative chat query
router.post("/query", (req, res) => {
  const { caseId, query } = req.body;
  if (!caseId || !query || query.length < 3) {
    return res.status(422).json({ error: { code: "VALIDATION_ERROR", message: "caseId and query (min 3 chars) are required." } });
  }

  const caseRecord = db.prepare("SELECT id FROM cases WHERE id = ?").get(caseId);
  if (!caseRecord) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Case not found." } });
  }

  // Get all evidence + analysis results for this case
  const results = db.prepare(`
    SELECT ar.*, e.original_name, e.id as eid
    FROM ai_results ar
    JOIN evidence e ON ar.evidence_id = e.id
    WHERE e.case_id = ?
    ORDER BY ar.confidence DESC
  `).all(caseId);

  // Extract search terms
  const stopWords = new Set(["the", "was", "were", "there", "this", "that", "with", "from", "have", "what", "when", "where", "does", "did"]);
  const terms = [...new Set((query.toLowerCase().match(/[a-z0-9]{3,}/g) || []))].filter((t) => !stopWords.has(t));

  // Score each result by keyword matches
  const matches = results
    .map((r) => {
      const payloadText = (r.payload || "").toLowerCase();
      const score = terms.filter((t) => payloadText.includes(t)).length;
      return { ...r, score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || (b.confidence || 0) - (a.confidence || 0));

  if (matches.length === 0) {
    return res.json({
      data: {
        answer: "The indexed evidence does not contain a detection or transcript that supports that conclusion. I will not speculate beyond the available case data.",
        citations: [],
        grounded: true
      }
    });
  }

  const top = matches.slice(0, 5);
  const statements = top.map((m) => {
    let payload = {};
    try { payload = JSON.parse(m.payload || "{}"); } catch (e) {}
    const subject = (payload.label || payload.text || m.type.toLowerCase()).slice(0, 180);
    const conf = m.confidence ? ` at ${(m.confidence * 100).toFixed(1)}% confidence` : "";
    const time = m.occurred_at ? ` (${m.occurred_at})` : "";
    return `${subject}${conf}${time} in ${m.original_name}`;
  });

  res.json({
    data: {
      answer: `Based strictly on indexed case evidence: ${statements.join("; ")}.`,
      citations: top.map((m) => ({
        evidenceId: m.eid,
        evidenceName: m.original_name,
        resultId: m.id,
        timestamp: m.occurred_at || null,
        confidence: m.confidence
      })),
      grounded: true
    }
  });
});

module.exports = router;
