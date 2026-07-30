/**
 * Supabase Database type definitions.
 * These match the SQL schema defined in supabase/001_initial_schema.sql.
 *
 * The structure follows the exact shape expected by @supabase/supabase-js
 * so that .from("table").insert(...) / .update(...) / .select(...) are typed.
 */

export type UserRole = "ADMIN" | "INVESTIGATOR" | "ANALYST";
export type CaseStatus = "OPEN" | "PROCESSING" | "REVIEW" | "CLOSED";
export type EvidenceStatus = "UPLOADED" | "QUEUED" | "PROCESSING" | "READY" | "FAILED";
export type AnalysisType = "DETECTION" | "OCR" | "TRANSCRIPTION" | "TRACKING" | "RECONSTRUCTION";

// Row shapes returned by SELECT
export interface UserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CaseRow {
  id: string;
  reference: string;
  title: string;
  description: string | null;
  location: string | null;
  occurred_at: string | null;
  status: string;
  priority: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface EvidenceRow {
  id: string;
  case_id: string;
  original_name: string;
  storage_key: string;
  file_hash: string;
  byte_size: string;
  mime_type: string;
  modality: string;
  metadata: Record<string, unknown>;
  status: string;
  captured_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIResultRow {
  id: string;
  evidence_id: string;
  type: string;
  model: string;
  model_version: string;
  confidence: number | null;
  occurred_at: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  case_id: string | null;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Partial<UserRow> & { id?: string };
        Update: Partial<UserRow>;
        Relationships: any[];
      };
      cases: {
        Row: CaseRow;
        Insert: Partial<CaseRow> & { reference: string; title: string; owner_id: string };
        Update: Partial<CaseRow>;
        Relationships: any[];
      };
      evidence: {
        Row: EvidenceRow;
        Insert: Partial<EvidenceRow> & {
          case_id: string;
          original_name: string;
          storage_key: string;
          file_hash: string;
          byte_size: string;
          mime_type: string;
          modality: string;
        };
        Update: Partial<EvidenceRow>;
        Relationships: any[];
      };
      ai_results: {
        Row: AIResultRow;
        Insert: Partial<AIResultRow> & {
          evidence_id: string;
          type: string;
          model: string;
          model_version: string;
        };
        Update: Partial<AIResultRow>;
        Relationships: any[];
      };
      audit_logs: {
        Row: AuditLogRow;
        Insert: Partial<AuditLogRow> & {
          actor_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
        };
        Update: Partial<AuditLogRow>;
        Relationships: any[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
