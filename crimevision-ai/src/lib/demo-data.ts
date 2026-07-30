import type { CaseDetail, DashboardSummary, TimelineEvent } from "./types";

export const primaryCaseId = "01d1d683-511d-48fb-b4f8-c1f7a72a24d8";

export const demoDashboard: DashboardSummary = {
  metrics: {
    activeCases: 18,
    evidenceItems: 2_847,
    pendingAnalysis: 12,
    integrityCoverage: 99.98
  },
  recentCases: [
    {
      id: primaryCaseId,
      reference: "CV-2026-041287",
      title: "Riverside Warehouse Incident",
      description: "Multi-camera reconstruction of a nighttime warehouse entry and vehicle departure.",
      location: "Riverside Industrial District",
      status: "PROCESSING",
      priority: 1,
      updatedAt: "2026-07-30T08:24:00.000Z",
      _count: { evidence: 38, auditLogs: 127 }
    },
    {
      id: "8d937796-9149-4d50-8e25-f919332705d5",
      reference: "CV-2026-039104",
      title: "Northbridge Transit Review",
      description: "Cross-camera person-of-interest movement analysis.",
      location: "Northbridge Central Station",
      status: "REVIEW",
      priority: 2,
      updatedAt: "2026-07-30T06:51:00.000Z",
      _count: { evidence: 21, auditLogs: 84 }
    },
    {
      id: "9cd24116-d808-4212-8c37-279018710240",
      reference: "CV-2026-036882",
      title: "Arden Avenue Collision",
      description: "Drone and bodycam photogrammetry for sequence reconstruction.",
      location: "Arden Avenue & 14th Street",
      status: "OPEN",
      priority: 3,
      updatedAt: "2026-07-29T22:12:00.000Z",
      _count: { evidence: 14, auditLogs: 49 }
    },
    {
      id: "96f1e96f-dbc2-46cd-ab9c-9bf117896a7f",
      reference: "CV-2026-035902",
      title: "West End Property Entry",
      description: "CCTV and access-log time correlation.",
      location: "West End",
      status: "CLOSED",
      priority: 4,
      updatedAt: "2026-07-28T16:05:00.000Z",
      _count: { evidence: 9, auditLogs: 36 }
    }
  ]
};

export const demoCase: CaseDetail = {
  ...demoDashboard.recentCases[0]!,
  occurredAt: "2026-07-28T21:42:18.000Z",
  owner: {
    id: "dev-investigator",
    displayName: "Alex Morgan",
    email: "investigator@crimevision.local"
  },
  evidence: [
    {
      id: "f38ae8b9-e102-4e9e-bef9-8e8c97d5c3df",
      originalName: "dock-camera-04.mp4",
      mimeType: "video/mp4",
      modality: "CCTV",
      fileHash: "f2cba54f73a42ec207dc6a71c3377ce96eb35f158662ac4c6d79cc5ccf25b509",
      byteSize: "184993201",
      status: "READY",
      capturedAt: "2026-07-28T21:42:18.000Z",
      createdAt: "2026-07-28T22:02:00.000Z",
      _count: { analyses: 17 }
    },
    {
      id: "755df0bb-0e1e-443b-8db4-55f30d332f99",
      originalName: "bodycam-officer-12.mp4",
      mimeType: "video/mp4",
      modality: "BODYCAM",
      fileHash: "a94d86e5d36f49c121fe9151b97f0a812d9585d67fd7e11d785562052e7c563e",
      byteSize: "93024188",
      status: "PROCESSING",
      capturedAt: "2026-07-28T21:50:07.000Z",
      createdAt: "2026-07-28T22:04:00.000Z",
      _count: { analyses: 8 }
    },
    {
      id: "64b75745-91c6-4478-8a4d-7b3e4c3a8e30",
      originalName: "scene-overview-02.jpg",
      mimeType: "image/jpeg",
      modality: "DRONE",
      fileHash: "4e4051d742fd2e9a8d68183c6a0bf1422634148759778f0d715f4b8e4d5e9bc7",
      byteSize: "12381042",
      status: "READY",
      capturedAt: "2026-07-28T22:10:24.000Z",
      createdAt: "2026-07-28T22:18:00.000Z",
      _count: { analyses: 11 }
    }
  ]
};

export const demoTimeline: TimelineEvent[] = [
  {
    id: "evt-1",
    evidenceId: demoCase.evidence[0]!.id,
    evidenceName: "dock-camera-04.mp4",
    type: "DETECTION",
    title: "Vehicle enters frame",
    description: "Dark sedan identified approaching loading dock 04.",
    confidence: 0.943,
    occurredAt: "2026-07-28T21:44:03.000Z",
    payload: { label: "vehicle" }
  },
  {
    id: "evt-2",
    evidenceId: demoCase.evidence[0]!.id,
    evidenceName: "dock-camera-04.mp4",
    type: "OCR",
    title: "Plate text recovered",
    description: "License plate candidate K7A-4821 recovered from frame sequence.",
    confidence: 0.887,
    occurredAt: "2026-07-28T21:44:07.000Z",
    payload: { text: "K7A-4821" }
  },
  {
    id: "evt-3",
    evidenceId: demoCase.evidence[1]!.id,
    evidenceName: "bodycam-officer-12.mp4",
    type: "TRACKING",
    title: "Subject track linked",
    description: "Track P-07 correlated across dock and east corridor cameras.",
    confidence: 0.912,
    occurredAt: "2026-07-28T21:45:31.000Z",
    payload: { trackId: "P-07" }
  },
  {
    id: "evt-4",
    evidenceId: demoCase.evidence[2]!.id,
    evidenceName: "scene-overview-02.jpg",
    type: "RECONSTRUCTION",
    title: "Scene alignment complete",
    description: "1.8M splats registered with 0.72 px mean reprojection error.",
    confidence: 0.971,
    occurredAt: "2026-07-28T22:18:48.000Z",
    payload: { splats: 1_800_000 }
  }
];
