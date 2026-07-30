const { Router } = require("express");
const db = require("../db");

const router = Router();

// Dashboard summary
router.get("/summary", (req, res) => {
  const activeCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status != 'CLOSED'").get().count;
  const evidenceItems = db.prepare("SELECT COUNT(*) as count FROM evidence").get().count;
  const pendingAnalysis = db.prepare("SELECT COUNT(*) as count FROM evidence WHERE status IN ('UPLOADED','QUEUED','PROCESSING')").get().count;
  const hashCount = db.prepare("SELECT COUNT(DISTINCT file_hash) as count FROM evidence").get().count;
  const integrityCoverage = evidenceItems === 0 ? 100 : Math.round((hashCount / evidenceItems) * 10000) / 100;

  const recentCases = db.prepare(`
    SELECT c.id, c.reference, c.title, c.status, c.priority, c.location, c.updated_at,
      (SELECT COUNT(*) FROM evidence WHERE case_id = c.id) as evidence_count
    FROM cases c ORDER BY c.updated_at DESC LIMIT 6
  `).all();

  res.json({
    data: {
      metrics: { activeCases, evidenceItems, pendingAnalysis, integrityCoverage },
      recentCases
    }
  });
});

module.exports = router;
