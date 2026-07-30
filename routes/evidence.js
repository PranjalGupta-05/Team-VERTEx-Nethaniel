const { Router } = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../db");

const router = Router();

const STORAGE_ROOT = path.join(__dirname, "..", "storage");
const STAGING_ROOT = path.join(STORAGE_ROOT, "staging");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, STAGING_ROOT),
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).slice(0, 12)}`)
  }),
  limits: { fileSize: 500 * 1024 * 1024, files: 1 }
});

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

// Upload evidence
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(422).json({ error: { code: "FILE_REQUIRED", message: "A file is required." } });
    }

    const { caseId, capturedAt, modality } = req.body;
    if (!caseId) {
      return res.status(422).json({ error: { code: "VALIDATION_ERROR", message: "caseId is required." } });
    }

    const caseRecord = db.prepare("SELECT id FROM cases WHERE id = ?").get(caseId);
    if (!caseRecord) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Case not found." } });
    }

    const evidenceId = crypto.randomUUID();
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);
    const storageKey = `raw/cases/${caseId}/${evidenceId}-${safeName}`;
    const destPath = path.join(STORAGE_ROOT, storageKey);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.renameSync(req.file.path, destPath);

    const fileHash = await sha256File(destPath);
    const byteSize = fs.statSync(destPath).size;

    // Infer modality from mime type if not provided
    let inferredModality = modality;
    if (!inferredModality) {
      if (req.file.mimetype.startsWith("image/")) inferredModality = "IMAGE";
      else if (req.file.mimetype.startsWith("video/")) inferredModality = "VIDEO";
      else if (req.file.mimetype.startsWith("audio/")) inferredModality = "AUDIO";
      else inferredModality = "DOCUMENT";
    }

    db.prepare(`
      INSERT INTO evidence (id, case_id, original_name, storage_key, file_hash, byte_size, mime_type, modality, captured_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(evidenceId, caseId, req.file.originalname, storageKey, fileHash, byteSize, req.file.mimetype, inferredModality, capturedAt || null);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, case_id, actor_id, action, resource_type, resource_id, details)
      VALUES (?, ?, ?, 'EVIDENCE_UPLOADED', 'Evidence', ?, ?)
    `).run(crypto.randomUUID(), caseId, req.actor.id, evidenceId, JSON.stringify({ fileHash, originalName: req.file.originalname, byteSize, mimeType: req.file.mimetype }));

    const created = db.prepare("SELECT * FROM evidence WHERE id = ?").get(evidenceId);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

// Verify evidence integrity
router.get("/:evidenceId/integrity", async (req, res, next) => {
  try {
    const evidence = db.prepare("SELECT * FROM evidence WHERE id = ?").get(req.params.evidenceId);
    if (!evidence) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Evidence not found." } });
    }

    const filePath = path.join(STORAGE_ROOT, evidence.storage_key);
    const actualHash = await sha256File(filePath);
    const verified = actualHash === evidence.file_hash;

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, case_id, actor_id, action, resource_type, resource_id, details)
      VALUES (?, ?, ?, 'EVIDENCE_INTEGRITY_VERIFIED', 'Evidence', ?, ?)
    `).run(crypto.randomUUID(), evidence.case_id, req.actor.id, evidence.id, JSON.stringify({ verified, expectedHash: evidence.file_hash, actualHash }));

    if (!verified) {
      return res.status(409).json({ error: { code: "INTEGRITY_MISMATCH", message: "Evidence integrity verification failed." } });
    }

    res.json({ data: { evidenceId: evidence.id, algorithm: "SHA-256", hash: actualHash, verified } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
