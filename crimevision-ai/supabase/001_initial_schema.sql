-- ============================================================================
-- CrimeVision AI — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- ─── Reset Existing Schema ──────────────────────────────────────────────────
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS ai_results CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─── Users Table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         TEXT,
  display_name  TEXT,
  role          TEXT NOT NULL DEFAULT 'ANALYST'
                CHECK (role IN ('ADMIN', 'INVESTIGATOR', 'ANALYST')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Cases Table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cases (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reference     TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  description   TEXT,
  location      TEXT,
  occurred_at   TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'OPEN'
                CHECK (status IN ('OPEN', 'PROCESSING', 'REVIEW', 'CLOSED')),
  priority      INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  owner_id      TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_owner    ON cases(owner_id);
CREATE INDEX IF NOT EXISTS idx_cases_status   ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_updated  ON cases(updated_at DESC);

-- ─── Evidence Table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS evidence (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id       TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_key   TEXT NOT NULL,
  file_hash     TEXT NOT NULL,
  byte_size     TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  modality      TEXT NOT NULL,
  metadata      JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'UPLOADED'
                CHECK (status IN ('UPLOADED', 'QUEUED', 'PROCESSING', 'READY', 'FAILED')),
  captured_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_case   ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON evidence(status);

-- ─── AI Results Table ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_results (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  evidence_id   TEXT NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  type          TEXT NOT NULL
                CHECK (type IN ('DETECTION', 'OCR', 'TRANSCRIPTION', 'TRACKING', 'RECONSTRUCTION')),
  model         TEXT NOT NULL,
  model_version TEXT NOT NULL,
  confidence    DOUBLE PRECISION,
  occurred_at   TIMESTAMPTZ,
  payload       JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_results_evidence ON ai_results(evidence_id);

-- ─── Audit Logs Table ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id       TEXT REFERENCES cases(id) ON DELETE SET NULL,
  actor_id      TEXT NOT NULL,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   TEXT NOT NULL,
  ip_address    TEXT,
  user_agent    TEXT,
  details       JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_case    ON audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ─── Disable RLS for development ────────────────────────────────────────────

ALTER TABLE users       DISABLE ROW LEVEL SECURITY;
ALTER TABLE cases       DISABLE ROW LEVEL SECURITY;
ALTER TABLE evidence    DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_results  DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs  DISABLE ROW LEVEL SECURITY;

-- ─── Seed Data ──────────────────────────────────────────────────────────────

-- User
INSERT INTO users (id, email, display_name, role)
VALUES ('dev-investigator', 'investigator@crimevision.local', 'Alex Morgan', 'INVESTIGATOR')
ON CONFLICT (id) DO NOTHING;

-- Cases
INSERT INTO cases (id, reference, title, description, location, occurred_at, status, priority, owner_id) VALUES
  ('01d1d683-511d-48fb-b4f8-c1f7a72a24d8', 'CV-2026-041287', 'Riverside Warehouse Incident',
   'Multi-camera reconstruction of a nighttime warehouse entry and vehicle departure.',
   'Riverside Industrial District', '2026-07-28T21:42:18.000Z', 'PROCESSING', 1, 'dev-investigator'),
  ('8d937796-9149-4d50-8e25-f919332705d5', 'CV-2026-039104', 'Northbridge Transit Review',
   'Transit platform evidence correlation and person-of-interest movement analysis.',
   'Northbridge Central Station', NULL, 'REVIEW', 2, 'dev-investigator'),
  ('9cd24116-d808-4212-8c37-279018710240', 'CV-2026-036882', 'Arden Avenue Collision',
   'Drone and bodycam photogrammetry for collision sequence reconstruction.',
   'Arden Avenue & 14th Street', NULL, 'OPEN', 3, 'dev-investigator')
ON CONFLICT (id) DO NOTHING;

-- Evidence
INSERT INTO evidence (id, case_id, original_name, storage_key, file_hash, byte_size, mime_type, modality, metadata, status, captured_at) VALUES
  ('f38ae8b9-e102-4e9e-bef9-8e8c97d5c3df', '01d1d683-511d-48fb-b4f8-c1f7a72a24d8',
   'dock-camera-04.mp4',
   'raw/cases/01d1d683-511d-48fb-b4f8-c1f7a72a24d8/f38ae8b9-e102-4e9e-bef9-8e8c97d5c3df-dock-camera-04.mp4',
   'f2cba54f73a42ec207dc6a71c3377ce96eb35f158662ac4c6d79cc5ccf25b509',
   '184993201', 'video/mp4', 'CCTV',
   '{"cameraId": "DOCK-04", "fps": 30, "integrityAlgorithm": "SHA-256"}',
   'READY', '2026-07-28T21:42:18.000Z')
ON CONFLICT (id) DO NOTHING;

-- AI Results
INSERT INTO ai_results (evidence_id, type, model, model_version, confidence, occurred_at, payload) VALUES
  ('f38ae8b9-e102-4e9e-bef9-8e8c97d5c3df', 'DETECTION', 'YOLOv8-x', '8.3', 0.943,
   '2026-07-28T21:44:03.000Z',
   '{"label": "vehicle", "subtype": "dark sedan", "bbox": [0.21, 0.44, 0.68, 0.91]}'),
  ('f38ae8b9-e102-4e9e-bef9-8e8c97d5c3df', 'OCR', 'PaddleOCR', '3.0', 0.887,
   '2026-07-28T21:44:07.000Z',
   '{"label": "license plate", "text": "K7A-4821", "orientation": 2.4}'),
  ('f38ae8b9-e102-4e9e-bef9-8e8c97d5c3df', 'DETECTION', 'YOLOv8-x', '8.3', 0.912,
   '2026-07-28T21:45:31.000Z',
   '{"label": "person", "trackId": "P-07", "bbox": [0.47, 0.18, 0.61, 0.88]}');

-- Initial audit log
INSERT INTO audit_logs (actor_id, case_id, action, resource_type, resource_id, details) VALUES
  ('dev-investigator', '01d1d683-511d-48fb-b4f8-c1f7a72a24d8', 'SEED_INITIALIZED', 'Case',
   '01d1d683-511d-48fb-b4f8-c1f7a72a24d8', '{"source": "development-seed"}');
