# API surface

All endpoints except `GET /health` require authentication. Development mode accepts `x-dev-user-id` and `x-dev-role`; production uses Clerk bearer tokens.

| Method | Endpoint | Roles | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Process health |
| GET | `/api/v1/dashboard/summary` | All | Command metrics |
| GET | `/api/v1/cases` | All | Search cases |
| POST | `/api/v1/cases` | Admin, Investigator | Create case |
| GET | `/api/v1/cases/:caseId` | All | Case workspace |
| PATCH | `/api/v1/cases/:caseId` | Admin, Investigator | Update case |
| GET | `/api/v1/cases/:caseId/audit` | Admin, Investigator | Chain of custody |
| POST | `/api/v1/evidence/upload` | Admin, Investigator | Multipart evidence ingestion |
| GET | `/api/v1/evidence/:evidenceId/integrity` | All | Recompute SHA-256 |
| POST | `/api/v1/analysis/evidence/:evidenceId/run` | Admin, Investigator | Queue inference |
| GET | `/api/v1/analysis/timeline/:caseId` | All | Normalized timeline |
| POST | `/api/v1/chat/query` | All | Evidence-grounded query |
| POST | `/api/v1/reports/cases/:caseId/manifest` | Admin, Investigator | Certified JSON manifest |

Error responses use a stable envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {}
  },
  "requestId": "..."
}
```
