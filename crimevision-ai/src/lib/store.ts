/**
 * Data store powered by Supabase PostgreSQL.
 * Drop-in async replacement for the original InMemoryStore.
 * Every public method keeps the same shape as before so API routes
 * only need to add `await`.
 */

import { supabase } from "./supabase";
import { createHash } from "node:crypto";
import type {
  CaseStatus,
  EvidenceStatus,
  AnalysisType,
  UserRow,
  CaseRow,
  EvidenceRow,
  AIResultRow,
  AuditLogRow,
} from "./database.types";

export type { CaseStatus, EvidenceStatus, AnalysisType };
export type UserRole = "ADMIN" | "INVESTIGATOR" | "ANALYST";

// Re-export interfaces matching the old store shapes (camelCase for API consumers)
export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  reference: string;
  title: string;
  description: string | null;
  location: string | null;
  occurredAt: string | null;
  status: CaseStatus;
  priority: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  originalName: string;
  storageKey: string;
  fileHash: string;
  byteSize: string;
  mimeType: string;
  modality: string;
  metadata: Record<string, unknown>;
  status: EvidenceStatus;
  capturedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIResult {
  id: string;
  evidenceId: string;
  type: AnalysisType;
  model: string;
  modelVersion: string;
  confidence: number | null;
  occurredAt: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  caseId: string | null;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string | null;
  userAgent: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

// ─── Row ↔ camelCase helpers ────────────────────────────────────────────────

function rowToUser(r: UserRow): User {
  return {
    id: r.id,
    email: r.email ?? null,
    displayName: r.display_name ?? null,
    role: r.role as UserRole,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToCase(r: CaseRow): Case {
  return {
    id: r.id,
    reference: r.reference,
    title: r.title,
    description: r.description ?? null,
    location: r.location ?? null,
    occurredAt: r.occurred_at ?? null,
    status: r.status as CaseStatus,
    priority: r.priority,
    ownerId: r.owner_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToEvidence(r: EvidenceRow): Evidence {
  return {
    id: r.id,
    caseId: r.case_id,
    originalName: r.original_name,
    storageKey: r.storage_key,
    fileHash: r.file_hash,
    byteSize: r.byte_size,
    mimeType: r.mime_type,
    modality: r.modality,
    metadata: r.metadata ?? {},
    status: r.status as EvidenceStatus,
    capturedAt: r.captured_at ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToAIResult(r: AIResultRow): AIResult {
  return {
    id: r.id,
    evidenceId: r.evidence_id,
    type: r.type as AnalysisType,
    model: r.model,
    modelVersion: r.model_version,
    confidence: r.confidence ?? null,
    occurredAt: r.occurred_at ?? null,
    payload: r.payload ?? {},
    createdAt: r.created_at,
  };
}

function rowToAuditLog(r: AuditLogRow): AuditLog {
  return {
    id: r.id,
    caseId: r.case_id ?? null,
    actorId: r.actor_id,
    action: r.action,
    resourceType: r.resource_type,
    resourceId: r.resource_id,
    ipAddress: r.ip_address ?? null,
    userAgent: r.user_agent ?? null,
    details: r.details ?? {},
    createdAt: r.created_at,
  };
}

// ─── Store ──────────────────────────────────────────────────────────────────

class SupabaseStore {
  // ─── User helpers ─────────────────────────────────────────────────────────

  public async findOrCreateUser(id: string, data?: Partial<User>): Promise<User> {
    const { data: existing } = await (supabase as any).from("users").select("*").eq("id", id).single();

    if (existing) {
      if (data) {
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (data.role !== undefined) updates.role = data.role;
        if (data.email !== undefined) updates.email = data.email;
        if (data.displayName !== undefined) updates.display_name = data.displayName;
        const { data: updated } = await (supabase as any).from("users").update(updates as any).eq("id", id).select("*").single();
        return rowToUser(updated!);
      }
      return rowToUser(existing);
    }

    const now = new Date().toISOString();
    const { data: created } = await (supabase as any).from("users")
      .insert({
        id,
        email: data?.email ?? null,
        display_name: data?.displayName ?? null,
        role: data?.role ?? "ANALYST",
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    return rowToUser(created!);
  }

  // ─── Case helpers ─────────────────────────────────────────────────────────

  public async listCases(filters?: { search?: string; status?: CaseStatus; ownerId?: string }) {
    let query = (supabase as any).from("cases").select("*").order("updated_at", { ascending: false }).limit(100);

    if (filters?.ownerId) query = query.eq("owner_id", filters.ownerId);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.search) {
      const q = filters.search;
      query = query.or(`title.ilike.%${q}%,reference.ilike.%${q}%,location.ilike.%${q}%`);
    }

    const { data: rows, error } = await query;
    if (error) {
      console.error("Supabase listCases error:", error);
    }
    if (!rows) return [];

    const result = [];
    for (const r of rows) {
      result.push(await this.caseSummary(rowToCase(r)));
    }
    return result;
  }

  public async findCaseById(id: string) {
    const { data: row } = await (supabase as any).from("cases").select("*").eq("id", id).single();
    if (!row) return null;

    const c = rowToCase(row);
    const owner = await this.getUserById(c.ownerId);

    const { data: evidenceRows } = await (supabase as any).from("evidence")
      .select("*")
      .eq("case_id", c.id)
      .order("created_at", { ascending: false });

    const evidenceList = [];
    for (const e of evidenceRows ?? []) {
      const ev = rowToEvidence(e);
      const { count } = await (supabase as any).from("ai_results")
        .select("*", { count: "exact", head: true })
        .eq("evidence_id", ev.id);

      evidenceList.push({
        id: ev.id,
        originalName: ev.originalName,
        mimeType: ev.mimeType,
        modality: ev.modality,
        fileHash: ev.fileHash,
        byteSize: ev.byteSize,
        status: ev.status,
        capturedAt: ev.capturedAt,
        createdAt: ev.createdAt,
        _count: { analyses: count ?? 0 },
      });
    }

    const summary = await this.caseSummary(c);
    return {
      ...summary,
      occurredAt: c.occurredAt,
      owner: {
        id: owner?.id ?? c.ownerId,
        displayName: owner?.displayName ?? null,
        email: owner?.email ?? null,
      },
      evidence: evidenceList,
    };
  }

  public async createCase(data: {
    ownerId: string;
    title: string;
    description?: string | null;
    location?: string | null;
    occurredAt?: string | null;
    priority: number;
  }) {
    const now = new Date().toISOString();
    const year = new Date().getUTCFullYear();
    const ref = `CV-${year}-${String(Math.floor(100000 + Math.random() * 900000))}`;

    const { data: row, error } = await (supabase as any).from("cases")
      .insert({
        reference: ref,
        title: data.title,
        description: data.description ?? null,
        location: data.location ?? null,
        occurred_at: data.occurredAt ?? null,
        status: "OPEN",
        priority: data.priority,
        owner_id: data.ownerId,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    return this.caseSummary(rowToCase(row!));

  }

  public async updateCase(
    id: string,
    data: Partial<Pick<Case, "title" | "description" | "location" | "occurredAt" | "priority" | "status">>
  ) {
    // Check if case exists
    const { data: existing } = await (supabase as any).from("cases").select("id").eq("id", id).single();
    if (!existing) return null;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.location !== undefined) updates.location = data.location;
    if (data.occurredAt !== undefined) updates.occurred_at = data.occurredAt;
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.status !== undefined) updates.status = data.status;

    const { data: row } = await (supabase as any).from("cases").update(updates).eq("id", id).select("*").single();

    return this.caseSummary(rowToCase(row!));
  }

  private async caseSummary(c: Case) {
    const owner = await this.getUserById(c.ownerId);

    const { count: evidenceCount } = await (supabase as any).from("evidence")
      .select("*", { count: "exact", head: true })
      .eq("case_id", c.id);

    const { count: auditCount } = await (supabase as any).from("audit_logs")
      .select("*", { count: "exact", head: true })
      .eq("case_id", c.id);

    return {
      id: c.id,
      reference: c.reference,
      title: c.title,
      description: c.description,
      location: c.location,
      occurredAt: c.occurredAt,
      status: c.status,
      priority: c.priority,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      owner: {
        id: owner?.id ?? c.ownerId,
        displayName: owner?.displayName ?? null,
        email: owner?.email ?? null,
      },
      _count: {
        evidence: evidenceCount ?? 0,
        auditLogs: auditCount ?? 0,
      },
    };
  }

  private async getUserById(id: string): Promise<User | null> {
    const { data } = await (supabase as any).from("users").select("*").eq("id", id).single();
    return data ? rowToUser(data) : null;
  }

  // ─── Evidence helpers ──────────────────────────────────────────────────────

  public async findEvidenceById(id: string) {
    const { data: row } = await (supabase as any).from("evidence").select("*").eq("id", id).single();
    if (!row) return null;

    const ev = rowToEvidence(row);

    const { data: resultRows } = await (supabase as any).from("ai_results")
      .select("*")
      .eq("evidence_id", ev.id)
      .order("created_at", { ascending: false });

    return {
      ...ev,
      analyses: (resultRows ?? []).map(rowToAIResult),
    };
  }

  public async createEvidence(data: Omit<Evidence, "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const { data: row } = await (supabase as any).from("evidence")
      .insert({
        id: data.id,
        case_id: data.caseId,
        original_name: data.originalName,
        storage_key: data.storageKey,
        file_hash: data.fileHash,
        byte_size: data.byteSize,
        mime_type: data.mimeType,
        modality: data.modality,
        metadata: data.metadata,
        status: data.status,
        captured_at: data.capturedAt,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    return rowToEvidence(row!);
  }

  public async updateEvidenceStatus(id: string, status: EvidenceStatus) {
    const { data: row } = await (supabase as any).from("evidence")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    return row ? rowToEvidence(row) : undefined;
  }

  // ─── Dashboard helpers ────────────────────────────────────────────────────

  public async dashboardSummary() {
    const { count: openCases } = await (supabase as any).from("cases")
      .select("*", { count: "exact", head: true })
      .neq("status", "CLOSED");

    const { count: evidenceCount } = await (supabase as any).from("evidence")
      .select("*", { count: "exact", head: true });

    const { count: pendingAnalysis } = await (supabase as any).from("evidence")
      .select("*", { count: "exact", head: true })
      .in("status", ["UPLOADED", "QUEUED", "PROCESSING"]);

    const { count: hashCount } = await (supabase as any).from("evidence")
      .select("*", { count: "exact", head: true })
      .neq("file_hash", "");

    const evCount = evidenceCount ?? 0;
    const integrityCoverage = evCount === 0 ? 100 : Math.round(((hashCount ?? 0) / evCount) * 10000) / 100;

    const { data: recentRows } = await (supabase as any).from("cases")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(6);

    const recentCases = [];
    for (const r of recentRows ?? []) {
      recentCases.push(await this.caseSummary(rowToCase(r)));
    }

    return {
      metrics: {
        activeCases: openCases ?? 0,
        evidenceItems: evCount,
        pendingAnalysis: pendingAnalysis ?? 0,
        integrityCoverage,
      },
      recentCases,
    };
  }

  // ─── Timeline helpers ─────────────────────────────────────────────────────

  public async timelineForCase(caseId: string) {
    // Get all evidence for this case
    const { data: evidenceRows } = await (supabase as any).from("evidence")
      .select("*")
      .eq("case_id", caseId);

    const caseEvidence = (evidenceRows ?? []).map(rowToEvidence);
    const evidenceIds = caseEvidence.map((e: any) => e.id);

    if (evidenceIds.length === 0) return [];

    const { data: resultRows } = await (supabase as any).from("ai_results")
      .select("*")
      .in("evidence_id", evidenceIds)
      .order("occurred_at", { ascending: true, nullsFirst: false });

    const results = (resultRows ?? []).map(rowToAIResult);

    return results.map((result: any) => {
      const ev = caseEvidence.find((e: any) => e.id === result.evidenceId)!;
      const payload = result.payload;
      const label = typeof payload.label === "string" ? payload.label : result.type.toLowerCase();
      const description =
        typeof payload.text === "string"
          ? payload.text
          : typeof payload.summary === "string"
            ? (payload.summary as string)
            : `${label} identified by ${result.model}.`;
      return {
        id: result.id,
        evidenceId: result.evidenceId,
        evidenceName: ev.originalName,
        type: result.type,
        title: label.replace(/\b\w/g, (ch: any) => ch.toUpperCase()),
        description,
        confidence: result.confidence,
        occurredAt: result.occurredAt ?? ev.capturedAt ?? ev.createdAt,
        payload,
      };
    });
  }

  // ─── Chat helpers ──────────────────────────────────────────────────────────

  public async chatAnswer(caseId: string, query: string) {
    const { data: evidenceRows } = await (supabase as any).from("evidence")
      .select("*")
      .eq("case_id", caseId);

    const caseEvidence = (evidenceRows ?? []).map(rowToEvidence);
    const evidenceIds = caseEvidence.map((e: any) => e.id);

    if (evidenceIds.length === 0) {
      return {
        answer: "The indexed evidence does not contain a detection or transcript that supports that conclusion. I will not speculate beyond the available case data.",
        citations: [] as { evidenceId: string; evidenceName: string; resultId: string; timestamp: string | null; confidence: number | null }[],
        grounded: true,
      };
    }

    const { data: resultRows } = await (supabase as any).from("ai_results")
      .select("*")
      .in("evidence_id", evidenceIds);

    const allResults = (resultRows ?? []).map(rowToAIResult);

    const stopWords = new Set(["the", "was", "were", "there", "this", "that", "with", "from", "have", "what", "when", "where", "does", "did"]);
    const terms = [...new Set(query.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])].filter(
      (t) => !stopWords.has(t)
    );

    const matches = allResults
      .map((result: any) => {
        const payloadText = JSON.stringify(result.payload).toLowerCase();
        const score = terms.filter((t) => payloadText.includes(t)).length;
        return { evidence: caseEvidence.find((e: any) => e.id === result.evidenceId)!, result, score };
      })
      .filter((m: any) => m.score > 0)
      .sort((a: any, b: any) => b.score - a.score || (b.result.confidence ?? 0) - (a.result.confidence ?? 0));

    if (matches.length === 0) {
      return {
        answer: "The indexed evidence does not contain a detection or transcript that supports that conclusion. I will not speculate beyond the available case data.",
        citations: [] as { evidenceId: string; evidenceName: string; resultId: string; timestamp: string | null; confidence: number | null }[],
        grounded: true,
      };
    }

    const top = matches.slice(0, 5);
    const statements = top.map(({ evidence, result }: any) => {
      const payload = result.payload;
      const subject = String(payload.label ?? payload.text ?? result.type).slice(0, 180);
      const conf = result.confidence ? ` at ${(result.confidence * 100).toFixed(1)}% confidence` : "";
      const time = result.occurredAt ? ` (${result.occurredAt})` : "";
      return `${subject}${conf}${time} in ${evidence.originalName}`;
    });

    return {
      answer: `Based strictly on indexed case evidence: ${statements.join("; ")}.`,
      citations: top.map(({ evidence, result }: any) => ({
        evidenceId: evidence.id,
        evidenceName: evidence.originalName,
        resultId: result.id,
        timestamp: result.occurredAt ?? null,
        confidence: result.confidence,
      })),
      grounded: true,
    };
  }

  // ─── Report helpers ────────────────────────────────────────────────────────

  public async createManifest(caseId: string) {
    const { data: row } = await (supabase as any).from("cases").select("*").eq("id", caseId).single();
    if (!row) return null;

    const c = rowToCase(row);
    const owner = await this.getUserById(c.ownerId);

    const { data: evidenceRows } = await (supabase as any).from("evidence")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    const evidenceList = (evidenceRows ?? []).map(rowToEvidence);

    const { count: auditCount } = await (supabase as any).from("audit_logs")
      .select("*", { count: "exact", head: true })
      .eq("case_id", caseId);

    const generatedAt = new Date().toISOString();
    const evidenceManifest = [];
    for (const e of evidenceList) {
      const { count } = await (supabase as any).from("ai_results")
        .select("*", { count: "exact", head: true })
        .eq("evidence_id", e.id);

      evidenceManifest.push({
        id: e.id,
        originalName: e.originalName,
        sha256: e.fileHash,
        mimeType: e.mimeType,
        byteSize: e.byteSize,
        status: e.status,
        analysisCount: count ?? 0,
      });
    }

    const canonical = JSON.stringify({ caseId, reference: c.reference, generatedAt, evidence: evidenceManifest });
    const certHash = createHash("sha256").update(canonical).digest("hex");

    return {
      reportVersion: "1.0",
      generatedAt,
      certification: {
        algorithm: "SHA-256",
        hash: certHash,
        statement: "This manifest cryptographically binds the listed evidence integrity hashes.",
      },
      case: {
        id: c.id,
        reference: c.reference,
        title: c.title,
        description: c.description,
        status: c.status,
        owner: { id: owner?.id ?? c.ownerId, displayName: owner?.displayName ?? null, email: owner?.email ?? null },
      },
      evidence: evidenceManifest,
      chainOfCustodyEvents: auditCount ?? 0,
    };
  }

  /**
   * Generate a comprehensive report aggregating all case data:
   * case summary, evidence inventory, timeline, AI findings,
   * confidence scores, and metadata.
   */
  public async generateFullReport(caseId: string) {
    const { data: row } = await (supabase as any).from("cases").select("*").eq("id", caseId).single();
    if (!row) return null;

    const c = rowToCase(row);
    const owner = await this.getUserById(c.ownerId);

    // Evidence list
    const { data: evidenceRows } = await (supabase as any).from("evidence")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    const evidenceList = (evidenceRows ?? []).map(rowToEvidence);
    const evidenceIds = evidenceList.map((e: Evidence) => e.id);

    // All AI results for this case
    let allResults: AIResult[] = [];
    if (evidenceIds.length > 0) {
      const { data: resultRows } = await (supabase as any).from("ai_results")
        .select("*")
        .in("evidence_id", evidenceIds)
        .order("created_at", { ascending: false });
      allResults = (resultRows ?? []).map(rowToAIResult);
    }

    // Audit count
    const { count: auditCount } = await (supabase as any).from("audit_logs")
      .select("*", { count: "exact", head: true })
      .eq("case_id", caseId);

    // Build evidence manifest
    const evidenceManifest = evidenceList.map((e: Evidence) => {
      const analysisCount = allResults.filter((r: AIResult) => r.evidenceId === e.id).length;
      return {
        id: e.id,
        originalName: e.originalName,
        sha256: e.fileHash,
        mimeType: e.mimeType,
        byteSize: e.byteSize,
        modality: e.modality,
        status: e.status,
        capturedAt: e.capturedAt,
        analysisCount,
      };
    });

    // Build timeline
    const timeline = allResults
      .filter((r: AIResult) => r.occurredAt)
      .sort((a: AIResult, b: AIResult) => new Date(a.occurredAt!).getTime() - new Date(b.occurredAt!).getTime())
      .map((r: AIResult) => {
        const ev = evidenceList.find((e: Evidence) => e.id === r.evidenceId)!;
        const payload = r.payload;
        const label = typeof payload.label === "string" ? payload.label : r.type.toLowerCase();
        const description =
          typeof payload.text === "string"
            ? payload.text
            : typeof payload.summary === "string"
              ? (payload.summary as string)
              : `${label} identified by ${r.model}.`;
        return {
          id: r.id,
          evidenceName: ev.originalName,
          type: r.type,
          title: label.replace(/\b\w/g, (ch: string) => ch.toUpperCase()),
          description,
          confidence: r.confidence,
          occurredAt: r.occurredAt ?? ev.capturedAt ?? ev.createdAt,
        };
      });

    // Build AI findings
    const aiFindings = allResults.map((r: AIResult) => {
      const ev = evidenceList.find((e: Evidence) => e.id === r.evidenceId)!;
      return {
        evidenceName: ev.originalName,
        type: r.type,
        model: r.model,
        confidence: r.confidence,
        occurredAt: r.occurredAt,
        payload: r.payload,
      };
    });

    // Build confidence summary
    const withConfidence = allResults.filter((r: AIResult) => r.confidence != null);
    const overall = withConfidence.length > 0
      ? withConfidence.reduce((sum: number, r: AIResult) => sum + r.confidence!, 0) / withConfidence.length
      : null;

    const byType: Record<string, { avg: number; count: number }> = {};
    for (const r of allResults) {
      if (r.confidence == null) continue;
      if (!byType[r.type]) byType[r.type] = { avg: 0, count: 0 };
      byType[r.type]!.avg += r.confidence;
      byType[r.type]!.count += 1;
    }
    for (const key of Object.keys(byType)) {
      byType[key]!.avg = byType[key]!.avg / byType[key]!.count;
    }

    // Certification hash
    const generatedAt = new Date().toISOString();
    const canonical = JSON.stringify({ caseId, reference: c.reference, generatedAt, evidence: evidenceManifest });
    const certHash = createHash("sha256").update(canonical).digest("hex");

    return {
      reportVersion: "1.0",
      generatedAt,
      certification: {
        algorithm: "SHA-256",
        hash: certHash,
        statement: "This report cryptographically binds the listed evidence integrity hashes and AI analysis results.",
      },
      case: {
        id: c.id,
        reference: c.reference,
        title: c.title,
        description: c.description,
        location: c.location,
        status: c.status,
        priority: c.priority,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        owner: { id: owner?.id ?? c.ownerId, displayName: owner?.displayName ?? null, email: owner?.email ?? null },
      },
      evidence: evidenceManifest,
      timeline,
      aiFindings,
      confidenceSummary: { overall, byType },
      chainOfCustodyEvents: auditCount ?? 0,
    };
  }

  // ─── Audit helpers ─────────────────────────────────────────────────────────

  public async recordAudit(data: {
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    caseId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
  }) {
    const { data: row } = await (supabase as any).from("audit_logs")
      .insert({
        actor_id: data.actorId,
        case_id: data.caseId ?? null,
        action: data.action,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        ip_address: data.ipAddress ?? null,
        user_agent: data.userAgent ?? null,
        details: data.details ?? {},
      })
      .select("*")
      .single();

    return rowToAuditLog(row!);
  }

  public async listAuditForCase(caseId: string) {
    const { data: rows } = await (supabase as any).from("audit_logs")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(100);

    const result = [];
    for (const r of rows ?? []) {
      const log = rowToAuditLog(r);
      const actor = await this.getUserById(log.actorId);
      result.push({
        ...log,
        actor: {
          displayName: actor?.displayName ?? null,
          email: actor?.email ?? null,
          role: actor?.role ?? "ANALYST",
        },
      });
    }
    return result;
  }

  // ─── AI Result helpers (used by analysis run route) ────────────────────────

  public async createAIResult(data: {
    evidenceId: string;
    type: AnalysisType;
    model: string;
    modelVersion: string;
    confidence: number | null;
    occurredAt: string | null;
    payload: Record<string, unknown>;
  }) {
    const { data: row } = await (supabase as any).from("ai_results")
      .insert({
        evidence_id: data.evidenceId,
        type: data.type,
        model: data.model,
        model_version: data.modelVersion,
        confidence: data.confidence,
        occurred_at: data.occurredAt,
        payload: data.payload,
      })
      .select("*")
      .single();

    return rowToAIResult(row!);
  }
}

// Singleton
export const store = new SupabaseStore();

