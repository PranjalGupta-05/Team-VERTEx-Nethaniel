const { Router } = require("express");
const crypto = require("crypto");
const db = require("../db");

const router = Router();

// List cases
router.get("/", (req, res) => {
  const { search, status } = req.query;
  let sql = `
    SELECT c.*, u.display_name as owner_name, u.email as owner_email,
      (SELECT COUNT(*) FROM evidence WHERE case_id = c.id) as evidence_count,
      (SELECT COUNT(*) FROM audit_logs WHERE case_id = c.id) as audit_count
    FROM cases c
    LEFT JOIN users u ON c.owner_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ` AND (c.title LIKE ? OR c.reference LIKE ? OR c.location LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (status) {
    sql += ` AND c.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY c.updated_at DESC LIMIT 100`;
  const cases = db.prepare(sql).all(...params);
  res.json({ data: cases });
});

// Create case
router.post("/", (req, res) => {
  const { title, description, location, occurredAt, priority } = req.body;
  if (!title || title.length < 3) {
    return res.status(422).json({ error: { code: "VALIDATION_ERROR", message: "Title is required (min 3 chars)." } });
  }

  const id = crypto.randomUUID();
  const year = new Date().getUTCFullYear();
  const reference = `CV-${year}-${crypto.randomInt(100000, 999999)}`;

  db.prepare(`
    INSERT INTO cases (id, reference, title, description, location, occurred_at, priority, owner_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, reference, title, description || null, location || null, occurredAt || null, priority || 2, req.actor.id);

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (id, case_id, actor_id, action, resource_type, resource_id, details)
    VALUES (?, ?, ?, 'CASE_CREATED', 'Case', ?, ?)
  `).run(crypto.randomUUID(), id, req.actor.id, id, JSON.stringify({ reference, title }));

  const created = db.prepare("SELECT * FROM cases WHERE id = ?").get(id);
  res.status(201).json({ data: created });
});

// Get single case
router.get("/:caseId", (req, res) => {
  const caseRecord = db.prepare(`
    SELECT c.*, u.display_name as owner_name, u.email as owner_email
    FROM cases c LEFT JOIN users u ON c.owner_id = u.id
    WHERE c.id = ?
  `).get(req.params.caseId);

  if (!caseRecord) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Case not found." } });
  }

  const evidence = db.prepare(`
    SELECT e.*, (SELECT COUNT(*) FROM ai_results WHERE evidence_id = e.id) as analysis_count
    FROM evidence e WHERE e.case_id = ? ORDER BY e.created_at DESC
  `).all(req.params.caseId);

  res.json({ data: { ...caseRecord, evidence } });
});

// Update case
router.patch("/:caseId", (req, res) => {
  const existing = db.prepare("SELECT * FROM cases WHERE id = ?").get(req.params.caseId);
  if (!existing) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Case not found." } });
  }

  const fields = [];
  const values = [];
  const allowed = ["title", "description", "location", "status", "priority"];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      // Map camelCase to snake_case for the 'occurredAt' field
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }
  if (req.body.occurredAt !== undefined) {
    fields.push("occurred_at = ?");
    values.push(req.body.occurredAt);
  }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(req.params.caseId);
    db.prepare(`UPDATE cases SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (id, case_id, actor_id, action, resource_type, resource_id, details)
    VALUES (?, ?, ?, 'CASE_UPDATED', 'Case', ?, ?)
  `).run(crypto.randomUUID(), req.params.caseId, req.actor.id, req.params.caseId, JSON.stringify({ changedFields: Object.keys(req.body) }));

  const updated = db.prepare("SELECT * FROM cases WHERE id = ?").get(req.params.caseId);
  res.json({ data: updated });
});

// Get case audit logs
router.get("/:caseId/audit", (req, res) => {
  const logs = db.prepare(`
    SELECT al.*, u.display_name as actor_name, u.email as actor_email, u.role as actor_role
    FROM audit_logs al LEFT JOIN users u ON al.actor_id = u.id
    WHERE al.case_id = ? ORDER BY al.created_at DESC LIMIT 100
  `).all(req.params.caseId);

  res.json({ data: logs });
});

module.exports = router;
