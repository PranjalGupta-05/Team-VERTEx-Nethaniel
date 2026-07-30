const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "data", "crimevision.db");

// Ensure data directory exists
const fs = require("fs");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    display_name TEXT,
    role TEXT DEFAULT 'ANALYST' CHECK(role IN ('ADMIN','INVESTIGATOR','ANALYST')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    occurred_at TEXT,
    status TEXT DEFAULT 'OPEN' CHECK(status IN ('OPEN','PROCESSING','REVIEW','CLOSED')),
    priority INTEGER DEFAULT 2 CHECK(priority BETWEEN 1 AND 4),
    owner_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    original_name TEXT NOT NULL,
    storage_key TEXT UNIQUE NOT NULL,
    file_hash TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    modality TEXT NOT NULL,
    status TEXT DEFAULT 'UPLOADED' CHECK(status IN ('UPLOADED','QUEUED','PROCESSING','READY','FAILED')),
    captured_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ai_results (
    id TEXT PRIMARY KEY,
    evidence_id TEXT NOT NULL,
    type TEXT NOT NULL,
    model TEXT NOT NULL,
    model_version TEXT NOT NULL,
    confidence REAL,
    occurred_at TEXT,
    payload TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    case_id TEXT,
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    FOREIGN KEY (actor_id) REFERENCES users(id)
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_cases_owner ON cases(owner_id, updated_at);
  CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status, updated_at);
  CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence(case_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_evidence_hash ON evidence(file_hash);
  CREATE INDEX IF NOT EXISTS idx_ai_results_evidence ON ai_results(evidence_id, type);
  CREATE INDEX IF NOT EXISTS idx_ai_results_time ON ai_results(occurred_at);
  CREATE INDEX IF NOT EXISTS idx_audit_case ON audit_logs(case_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id, created_at);
`);

// Seed a default dev user if none exists
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
  db.prepare(`
    INSERT INTO users (id, email, display_name, role)
    VALUES ('dev-investigator', 'investigator@crimevision.local', 'Alex Morgan', 'INVESTIGATOR')
  `).run();
}

module.exports = db;
