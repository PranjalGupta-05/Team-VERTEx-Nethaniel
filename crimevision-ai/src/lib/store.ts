/**
 * In-memory data store that replaces PostgreSQL + Prisma.
 * Pre-seeded with demo data matching the original seed.ts.
 * Data resets on server restart — this is intentional for a simple dev setup.
 */

import { randomUUID, createHash } from "node:crypto";

// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "INVESTIGATOR" | "ANALYST";
export type CaseStatus = "OPEN" | "PROCESSING" | "REVIEW" | "CLOSED";
export type EvidenceStatus = "UPLOADED" | "QUEUED" | "PROCESSING" | "READY" | "FAILED";
export type AnalysisType = "DETECTION" | "OCR" | "TRANSCRIPTION" | "TRACKING" | "RECONSTRUCTION";

// ─── Models ──────────────────────────────────────────────────────────────────

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

// ─── Store ───────────────────────────────────────────────────────────────────

class InMemoryStore {
  public users: User[] = [];
  public cases: Case[] = [];
  public evidence: Evidence[] = [];
  public aiResults: AIResult[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  private seed(): void {
    const now = new Date().toISOString();

    // User
    this.users.push({
      id: "dev-investigator",
      email: "investigator@crimevision.local",
      displayName: "Alex Morgan",
      role: "INVESTIGATOR",
      createdAt: now,
      updatedAt: now,
    });

    // Cases
    const cases: Omit<Case, "ownerId" | "createdAt" | "updatedAt">[] = [
      {
        id: "01d1d683-511d-48fb-b4f8-c1f7a72a24d8",
        reference: "CV-2026-041287",
        title: "Riverside Warehouse Incident",
        description: "Multi-camera reconstruction of a nighttime warehouse entry and vehicle departure.",
        location: "Riverside Industrial District",
        occurredAt: "2026-07-28T21:42:18.000Z",
        status: "PROCESSING",
        priority: 1,
      },
      {
        id: "8d937796-9149-4d50-8e25-f919332705d5",
        reference: "CV-2026-039104",
        title: "Northbridge Transit Review",
        description: "Transit platform evidence correlation and person-of-interest movement analysis.",
        location: "Northbridge Central Station",
        occurredAt: null,
        status: "REVIEW",
        priority: 2,
      },
      {
        id: "9cd24116-d808-4212-8c37-279018710240",
        reference: "CV-2026-036882",
        title: "Arden Avenue Collision",
        description: "Drone and bodycam photogrammetry for collision sequence reconstruction.",
        location: "Arden Avenue & 14th Street",
        occurredAt: null,
        status: "OPEN",
        priority: 3,
      },
    ];

    for (const c of cases) {
      this.cases.push({
        ...c,
        ownerId: "dev-investigator",
        createdAt: now,
        updatedAt: now,
      });
    }

    // Evidence
    const evidenceId = "f38ae8b9-e102-4e9e-bef9-8e8c97d5c3df";
    this.evidence.push({
      id: evidenceId,
      caseId: cases[0]!.id,
      originalName: "dock-camera-04.mp4",
      storageKey: `raw/cases/${cases[0]!.id}/${evidenceId}-dock-camera-04.mp4`,
      fileHash: "f2cba54f73a42ec207dc6a71c3377ce96eb35f158662ac4c6d79cc5ccf25b509",
      byteSize: "184993201",
      mimeType: "video/mp4",
      modality: "CCTV",
      metadata: { cameraId: "DOCK-04", fps: 30, integrityAlgorithm: "SHA-256" },
      status: "READY",
      capturedAt: "2026-07-28T21:42:18.000Z",
      createdAt: now,
      updatedAt: now,
    });

    // AI Results
    this.aiResults.push(
      {
        id: randomUUID(),
        evidenceId,
        type: "DETECTION",
        model: "YOLOv8-x",
        modelVersion: "8.3",
        confidence: 0.943,
        occurredAt: "2026-07-28T21:44:03.000Z",
        payload: { label: "vehicle", subtype: "dark sedan", bbox: [0.21, 0.44, 0.68, 0.91] },
        createdAt: now,
      },
      {
        id: randomUUID(),
        evidenceId,
        type: "OCR",
        model: "PaddleOCR",
        modelVersion: "3.0",
        confidence: 0.887,
        occurredAt: "2026-07-28T21:44:07.000Z",
        payload: { label: "license plate", text: "K7A-4821", orientation: 2.4 },
        createdAt: now,
      },
      {
        id: randomUUID(),
        evidenceId,
        type: "DETECTION",
        model: "YOLOv8-x",
        modelVersion: "8.3",
        confidence: 0.912,
        occurredAt: "2026-07-28T21:45:31.000Z",
        payload: { label: "person", trackId: "P-07", bbox: [0.47, 0.18, 0.61, 0.88] },
        createdAt: now,
      }
    );

    // Initial audit log
    this.auditLogs.push({
      id: randomUUID(),
      actorId: "dev-investigator",
      caseId: cases[0]!.id,
      action: "SEED_INITIALIZED",
      resourceType: "Case",
      resourceId: cases[0]!.id,
      ipAddress: null,
      userAgent: null,
      details: { source: "development-seed" },
      createdAt: now,
    });
  }

  // ─── User helpers ─────────────────────────────────────────────────────────

  public findOrCreateUser(id: string, data?: Partial<User>): User {
    let user = this.users.find((u) => u.id === id);
    if (!user) {
      user = {
        id,
        email: data?.email ?? null,
        displayName: data?.displayName ?? null,
        role: data?.role ?? "ANALYST",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.users.push(user);
    } else if (data) {
      if (data.role !== undefined) user.role = data.role;
      if (data.email !== undefined) user.email = data.email;
      if (data.displayName !== undefined) user.displayName = data.displayName;
      user.updatedAt = new Date().toISOString();
    }
    return user;
  }

  // ─── Case helpers ─────────────────────────────────────────────────────────

  public listCases(filters?: { search?: string; status?: CaseStatus; ownerId?: string }) {
    let result = [...this.cases];
    if (filters?.ownerId) result = result.filter((c) => c.ownerId === filters.ownerId);
    if (filters?.status) result = result.filter((c) => c.status === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.reference.toLowerCase().includes(q) ||
          (c.location?.toLowerCase().includes(q) ?? false)
      );
    }
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return result.slice(0, 100).map((c) => this.caseSummary(c));
  }

  public findCaseById(id: string) {
    const c = this.cases.find((c) => c.id === id);
    if (!c) return null;
    const owner = this.users.find((u) => u.id === c.ownerId);
    const evidenceList = this.evidence
      .filter((e) => e.caseId === c.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((e) => ({
        id: e.id,
        originalName: e.originalName,
        mimeType: e.mimeType,
        modality: e.modality,
        fileHash: e.fileHash,
        byteSize: e.byteSize,
        status: e.status,
        capturedAt: e.capturedAt,
        createdAt: e.createdAt,
        _count: { analyses: this.aiResults.filter((r) => r.evidenceId === e.id).length },
      }));
    return {
      ...this.caseSummary(c),
      occurredAt: c.occurredAt,
      owner: {
        id: owner?.id ?? c.ownerId,
        displayName: owner?.displayName ?? null,
        email: owner?.email ?? null,
      },
      evidence: evidenceList,
    };
  }

  public createCase(data: {
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
    const c: Case = {
      id: randomUUID(),
      reference: ref,
      title: data.title,
      description: data.description ?? null,
      location: data.location ?? null,
      occurredAt: data.occurredAt ?? null,
      status: "OPEN",
      priority: data.priority,
      ownerId: data.ownerId,
      createdAt: now,
      updatedAt: now,
    };
    this.cases.push(c);
    return this.caseSummary(c);
  }

  public updateCase(id: string, data: Partial<Pick<Case, "title" | "description" | "location" | "occurredAt" | "priority" | "status">>) {
    const c = this.cases.find((c) => c.id === id);
    if (!c) return null;
    if (data.title !== undefined) c.title = data.title;
    if (data.description !== undefined) c.description = data.description;
    if (data.location !== undefined) c.location = data.location;
    if (data.occurredAt !== undefined) c.occurredAt = data.occurredAt;
    if (data.priority !== undefined) c.priority = data.priority;
    if (data.status !== undefined) c.status = data.status;
    c.updatedAt = new Date().toISOString();
    return this.caseSummary(c);
  }

  private caseSummary(c: Case) {
    const owner = this.users.find((u) => u.id === c.ownerId);
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
        evidence: this.evidence.filter((e) => e.caseId === c.id).length,
        auditLogs: this.auditLogs.filter((a) => a.caseId === c.id).length,
      },
    };
  }

  // ─── Evidence helpers ──────────────────────────────────────────────────────

  public findEvidenceById(id: string) {
    const e = this.evidence.find((e) => e.id === id);
    if (!e) return null;
    return {
      ...e,
      analyses: this.aiResults
        .filter((r) => r.evidenceId === e.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    };
  }

  public createEvidence(data: Omit<Evidence, "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const e: Evidence = { ...data, createdAt: now, updatedAt: now };
    this.evidence.push(e);
    return e;
  }

  public updateEvidenceStatus(id: string, status: EvidenceStatus) {
    const e = this.evidence.find((e) => e.id === id);
    if (e) {
      e.status = status;
      e.updatedAt = new Date().toISOString();
    }
    return e;
  }

  // ─── Dashboard helpers ────────────────────────────────────────────────────

  public dashboardSummary() {
    const openCases = this.cases.filter((c) => c.status !== "CLOSED").length;
    const evidenceCount = this.evidence.length;
    const pendingAnalysis = this.evidence.filter((e) =>
      ["UPLOADED", "QUEUED", "PROCESSING"].includes(e.status)
    ).length;
    const hashCount = this.evidence.filter((e) => e.fileHash.length > 0).length;
    const integrityCoverage = evidenceCount === 0 ? 100 : Math.round((hashCount / evidenceCount) * 10000) / 100;

    const recentCases = [...this.cases]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map((c) => this.caseSummary(c));

    return {
      metrics: { activeCases: openCases, evidenceItems: evidenceCount, pendingAnalysis, integrityCoverage },
      recentCases,
    };
  }

  // ─── Timeline helpers ─────────────────────────────────────────────────────

  public timelineForCase(caseId: string) {
    const caseEvidence = this.evidence.filter((e) => e.caseId === caseId);
    const evidenceIds = new Set(caseEvidence.map((e) => e.id));
    const results = this.aiResults
      .filter((r) => evidenceIds.has(r.evidenceId))
      .sort((a, b) => {
        const dateA = a.occurredAt ?? a.createdAt;
        const dateB = b.occurredAt ?? b.createdAt;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

    return results.map((result) => {
      const ev = caseEvidence.find((e) => e.id === result.evidenceId)!;
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
        title: label.replace(/\b\w/g, (ch) => ch.toUpperCase()),
        description,
        confidence: result.confidence,
        occurredAt: result.occurredAt ?? ev.capturedAt ?? ev.createdAt,
        payload,
      };
    });
  }

  // ─── Chat helpers ──────────────────────────────────────────────────────────

  public chatAnswer(caseId: string, query: string) {
    const caseEvidence = this.evidence.filter((e) => e.caseId === caseId);
    const evidenceIds = new Set(caseEvidence.map((e) => e.id));
    const allResults = this.aiResults.filter((r) => evidenceIds.has(r.evidenceId));

    const stopWords = new Set(["the", "was", "were", "there", "this", "that", "with", "from", "have", "what", "when", "where", "does", "did"]);
    const terms = [...new Set(query.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])].filter(
      (t) => !stopWords.has(t)
    );

    const matches = allResults
      .map((result) => {
        const payloadText = JSON.stringify(result.payload).toLowerCase();
        const score = terms.filter((t) => payloadText.includes(t)).length;
        return { evidence: caseEvidence.find((e) => e.id === result.evidenceId)!, result, score };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score || (b.result.confidence ?? 0) - (a.result.confidence ?? 0));

    if (matches.length === 0) {
      return {
        answer: "The indexed evidence does not contain a detection or transcript that supports that conclusion. I will not speculate beyond the available case data.",
        citations: [] as { evidenceId: string; evidenceName: string; resultId: string; timestamp: string | null; confidence: number | null }[],
        grounded: true,
      };
    }

    const top = matches.slice(0, 5);
    const statements = top.map(({ evidence, result }) => {
      const payload = result.payload;
      const subject = String(payload.label ?? payload.text ?? result.type).slice(0, 180);
      const conf = result.confidence ? ` at ${(result.confidence * 100).toFixed(1)}% confidence` : "";
      const time = result.occurredAt ? ` (${result.occurredAt})` : "";
      return `${subject}${conf}${time} in ${evidence.originalName}`;
    });

    return {
      answer: `Based strictly on indexed case evidence: ${statements.join("; ")}.`,
      citations: top.map(({ evidence, result }) => ({
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

  public createManifest(caseId: string) {
    const c = this.cases.find((c) => c.id === caseId);
    if (!c) return null;
    const owner = this.users.find((u) => u.id === c.ownerId);
    const evidenceList = this.evidence
      .filter((e) => e.caseId === caseId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const auditCount = this.auditLogs.filter((a) => a.caseId === caseId).length;

    const generatedAt = new Date().toISOString();
    const evidenceManifest = evidenceList.map((e) => ({
      id: e.id,
      originalName: e.originalName,
      sha256: e.fileHash,
      mimeType: e.mimeType,
      byteSize: e.byteSize,
      status: e.status,
      analysisCount: this.aiResults.filter((r) => r.evidenceId === e.id).length,
    }));
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
      chainOfCustodyEvents: auditCount,
    };
  }

  // ─── Audit helpers ─────────────────────────────────────────────────────────

  public recordAudit(data: {
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    caseId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
  }) {
    const log: AuditLog = {
      id: randomUUID(),
      actorId: data.actorId,
      caseId: data.caseId ?? null,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      details: data.details ?? {},
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.push(log);
    return log;
  }

  public listAuditForCase(caseId: string) {
    return this.auditLogs
      .filter((a) => a.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100)
      .map((a) => {
        const actor = this.users.find((u) => u.id === a.actorId);
        return {
          ...a,
          actor: { displayName: actor?.displayName ?? null, email: actor?.email ?? null, role: actor?.role ?? "ANALYST" },
        };
      });
  }
}

// Singleton — persists across API route invocations in dev mode (hot reload preserves globalThis)
declare global {
  var crimeVisionStore: InMemoryStore | undefined;
}

export const store = globalThis.crimeVisionStore ?? new InMemoryStore();

if (process.env.NODE_ENV !== "production") {
  globalThis.crimeVisionStore = store;
}
