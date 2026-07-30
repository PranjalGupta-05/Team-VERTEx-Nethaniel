# CrimeVision AI

CrimeVision AI is a production-oriented foundation for digital evidence ingestion, AI-assisted indexing, 3D scene review, grounded investigation, and certified case exports. It follows the supplied SDD's modular-monolith constraint: business modules share one transactional backend deployment without collapsing their responsibilities into a single service layer.

## What is implemented

- Professional Next.js command center, case registry, case workspace, live Three.js point-cloud scene, evidence rail, timeline, grounded chat, upload flow, and certified manifest export.
- Express modular monolith with Zod validation, Clerk-compatible authentication, role checks, structured logging, rate limiting, and consistent error envelopes.
- PostgreSQL/Prisma data model for users, cases, evidence, AI results, and append-only audit events.
- Streamed evidence storage, SHA-256 hashing, recomputation endpoint, file limits, and a deterministic storage hierarchy.
- Redis/BullMQ analysis queue with retries and a separately containerized FastAPI inference boundary.
- Deterministic demo model adapters, seed data, TypeScript/Python tests, Dockerfiles, Compose infrastructure, and CI.

## Run locally

Prerequisites: Node.js 22+, pnpm 11.18+, Python 3.12+, and Docker.

1. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env.local`.
2. Start infrastructure:

   ```bash
   docker compose up -d postgres redis ai-engine
   ```

3. Install and initialize:

   ```bash
   pnpm install
   pnpm db:generate
   pnpm db:migrate --name initial
   pnpm db:seed
   ```

4. Start the application:

   ```bash
   pnpm dev
   ```

Open `http://localhost:3000`. With `NEXT_PUBLIC_DEMO_MODE=true`, the UI remains explorable if the API is temporarily unavailable.

## Validate

```bash
pnpm typecheck
pnpm test
pnpm build

cd ai_engine
python -m pip install -r requirements-dev.txt
python -m pytest
```

## Production configuration

- Set `AUTH_MODE=clerk`, provide both Clerk keys, and set `CLERK_AUTHORIZED_PARTIES` to the exact frontend origins.
- Set `NEXT_PUBLIC_AUTH_MODE=clerk`, configure the publishable key, and disable demo fallback.
- Use Supabase PostgreSQL or an equivalent PostgreSQL 16 service with TLS.
- Replace `LocalEvidenceStorage` with an S3-compatible adapter that uses object lock/versioning; keep its narrow contract.
- Deploy a Redis service and run exactly the desired number of BullMQ workers.
- Replace deterministic inference adapters only with versioned, checksummed, independently validated model artifacts.
- Put the backend behind TLS, configure secret management, centralize logs, and connect Sentry/Prometheus.

## Important limitation

The included AI outputs are deterministic integration fixtures, not forensic findings. They are visibly marked as demo results and must never be used as evidence. Courtroom or operational use requires jurisdiction-specific legal review, validated model weights, calibrated thresholds, documented human review, chain-of-custody procedures, and independent accuracy testing.

See [architecture](docs/architecture.md) and [API surface](docs/api.md) for implementation details.
