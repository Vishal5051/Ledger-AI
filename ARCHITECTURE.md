# Architecture Overview

```mermaid
flowchart LR
    UI[Frontend (React + Vite + Bootstrap)] -->|REST API| API[Backend (Express)]
    API -->|Mongoose| DB[MongoDB]
    API -->|auditEngine (pure JS)| UI
```

## System Components
- **Frontend**: React SPA built with Vite, styled with custom CSS (glass‑morphism cards, gradient CTA buttons) and Bootstrap utilities for responsive grid. State persisted in `localStorage` under keys `ai_audit_tools`, `ai_audit_team_size`, `ai_audit_global_use_case`. Uses Axios for API calls.
- **Backend API**: Express server exposing `/api/audit` (POST to create, GET by ID) and `/api/lead` (POST to capture leads). Implements CORS with origin whitelist and reads `process.env.VITE_API_BASE` for flexible deployment.
- **Database**: MongoDB stores `Audit` documents (`tools`, `teamSize`, `globalUseCase`, `report`) and `Lead` documents (contact info, audit reference). Indexes on `auditId` and `createdAt` for fast retrieval.
- **Audit Engine** (`src/utils/auditEngine.js`): Pure, deterministic JavaScript module that calculates total spend, optimized spend, savings, confidence levels, and generates a list of recommendations. No side effects; unit‑tested with Vitest.
- **Pricing Data** (`src/data/pricingData.js`): Central dictionary of tool plans, seat limits, pricing models (per‑seat, flat, usage), and enterprise flags. Used by the audit engine for cost calculations.

## Data Flow
1. User configures tools in **SpendForm** and clicks *Generate Audit*.
2. Frontend POSTs payload to **`POST /api/audit`**.
3. Backend validates the payload, invokes `calculateAudit`, stores the full report in MongoDB, returns an audit ID.
4. Frontend receives the ID, updates the shareable URL (`?id=...`) and optionally stores a Base64 fallback token.
5. Result page fetches the report via **`GET /api/audit/:id`** (or decodes the token) and renders the dashboard.
6. Lead capture form posts to **`POST /api/lead`**, linking the lead to the audit ID for follow‑up.

## Persistence Strategy
- **LocalStorage** holds the raw tool array, team size, and global use case so a user can refresh the page without losing progress. The engine safely parses JSON and falls back to defaults on error, preventing crashes.
- **MongoDB** provides durable storage for shared audits and leads. The `Audit` schema stores the original input plus the computed `report` object, enabling fast retrieval without re‑running the engine.

## Scalability (10k audits/day)
- **Stateless API**: Deploy multiple Express instances behind an NGINX load balancer; each instance can spin up a lightweight container with the audit engine (CPU‑light, <10 ms per audit).
- **MongoDB**: Sharded cluster with indexing on `auditId` and TTL index on `createdAt` (30‑day retention) to keep storage bounded.
- **Caching (optional)**: Recent audit IDs cached in Redis for sub‑second fetches; fallback to DB on miss.
- **Horizontal scaling** of the audit engine: because it is pure JS with no shared state, it can run in parallel workers or serverless functions.

## Tech Choice Rationale
- **React + JavaScript**: Faster iteration for an MVP; the team already has deep JavaScript expertise, avoiding the compilation overhead of TypeScript while still producing maintainable code through JSDoc annotations.
- **Bootstrap**: Provides a solid responsive grid and utility classes without pulling a heavy UI library. Custom CSS adds glass‑morphism and gradient CTA styling for a premium look.
- **Node/Express**: Minimalistic, flexible routing; easy to extend with additional audit endpoints.
- **MongoDB**: Schema‑flexible, matches the nested audit report structure, and integrates smoothly with Mongoose models.
- **LocalStorage**: Guarantees a fully client‑side experience for users who prefer not to create an account; the fallback Base64 URL ensures shareability even when the backend is offline.

## Engineering Trade‑offs (7‑day Sprint)
| Trade‑off | Decision | Reasoning |
|-----------|----------|-----------|
| Type safety vs speed | **JavaScript only** | Delivered MVP within 7 days; added JSDoc for key functions to aid future migration to TypeScript. |
| UI library vs custom styling | **Bootstrap + custom CSS** | Avoided bundle bloat of Tailwind; custom classes gave us glass‑morphism without a UI framework. |
| Immediate shareability vs DB dependency | **Base64 URL fallback** | Ensured audit links work even if the backend is down, improving reliability for early adopters. |
| Detailed analytics vs simplicity | **Minimal event tracking** (page view, share click) | Kept initial implementation lightweight; plan to add Segment/Amplitude later. |

*All sections reference real implementation files: `Result.jsx`, `SpendForm.jsx`, `auditEngine.js`, `pricingData.js`, backend `controllers/*.js`, and `.env` configuration.*
