export type CaseStatus = "OPEN" | "PROCESSING" | "REVIEW" | "CLOSED";
export type EvidenceStatus = "UPLOADED" | "QUEUED" | "PROCESSING" | "READY" | "FAILED";

export interface CaseSummary {
  id: string;
  reference: string;
  title: string;
  description?: string | null;
  location?: string | null;
  status: CaseStatus;
  priority: number;
  updatedAt: string;
  _count: { evidence: number; auditLogs?: number };
}

export interface EvidenceSummary {
  id: string;
  originalName: string;
  mimeType: string;
  modality: string;
  fileHash: string;
  byteSize: string;
  status: EvidenceStatus;
  capturedAt: string | null;
  createdAt: string;
  _count: { analyses: number };
}

export interface CaseDetail extends CaseSummary {
  occurredAt?: string | null;
  owner: { id: string; displayName: string | null; email: string | null };
  evidence: EvidenceSummary[];
}

export interface DashboardSummary {
  metrics: {
    activeCases: number;
    evidenceItems: number;
    pendingAnalysis: number;
    integrityCoverage: number;
  };
  recentCases: CaseSummary[];
}

export interface TimelineEvent {
  id: string;
  evidenceId: string;
  evidenceName: string;
  type: string;
  title: string;
  description: string;
  confidence: number | null;
  occurredAt: string;
  payload: unknown;
}

export interface ChatAnswer {
  answer: string;
  citations: Array<{
    evidenceId: string;
    evidenceName: string;
    resultId: string;
    timestamp: string | null;
    confidence: number | null;
  }>;
  grounded: boolean;
}
