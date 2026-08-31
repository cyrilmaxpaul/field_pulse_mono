# FieldPulse — Handoff Notes

Status as of this handoff: **Phases 1–6 complete and verified end-to-end** (backend via curl, frontend via real browser tests including simulated offline/reconnect). Pushed to `main` at commit `d38ea07`. Phases 7–10 are not started.

This doc is written for whoever (or whichever future session) picks this up next — it assumes no memory of the build process, only the code and the blueprint.

## 1. Getting oriented

- **Source of truth for the full plan**: `FieldPulse_Product_and_Technical_Blueprint.md` at the repo root. Every phase below maps to a section in it.
- **README.md** has the architecture overview, tech stack, and local setup steps.
- **Login**: `admin@fieldpulse.dev` / `Password123!` (seeded via `pnpm db:seed`, demo org "Demo Construction Co").
- **Run it**: `pnpm install && pnpm prisma:push && pnpm db:seed && pnpm dev` (API on :4000, web on :5173). Needs `.env` filled in from `.env.example` — Neon Postgres, Upstash Redis, Supabase S3-compatible Storage credentials.
- **No git remote credential issues**: SSH access to `github.com:cyrilmaxpaul/field_pulse_mono.git` is already working from this machine.
- **Commit convention for this repo**: no `Co-Authored-By: Claude` trailer, ever — the user asked for this explicitly.

## 2. What's built (Phases 1–6)

| Area | Where | Notes |
|---|---|---|
| Auth | `apps/api/src/modules/auth`, `apps/web/src/features/auth` | JWT access (15m) + refresh (7d, rotated, httpOnly cookie). Reuse of a rotated token revokes **all** sessions for that user (theft response, not just a 401) — a real UX tradeoff: two tabs racing a refresh at the same instant can both get logged out. |
| RBAC | `apps/api/src/middleware/permissions.ts`, `packages/shared-types/src/permissions.ts` | Data-driven: `Role → RolePermission → Permission`, not a hardcoded enum. Catalog currently has `inspection.{read,create,update,submit,review,approve}`, `site.manage`, `user.manage`, `template.manage`, `report.read`, `audit.read`. **`review`, `approve`, `report.read`, `audit.read` are defined but not yet checked anywhere** — Phases 8/9 need to actually gate on them. |
| Sites / Users / Roles | `apps/api/src/modules/{sites,users,roles}` | Straightforward CRUD, org-scoped everywhere. |
| Templates | `apps/api/src/modules/templates`, `apps/web/src/features/templates` | Full versioning: draft → publish → locked; editing a published template clones a new draft version rather than mutating history. Builder UI uses up/down buttons for reordering, not drag-and-drop (deliberate simplification — noted at the time, not revisited). Conditional question visibility and validation-rule editing are **not implemented** — the schema has `conditionalRules`/`validationRules` JSON columns but nothing reads or writes them yet. |
| Inspections | `apps/api/src/modules/inspections`, `apps/web/src/features/inspections` | Server-enforced state machine in `inspection.service.ts` (`ALLOWED_TRANSITIONS`). Currently only `ASSIGNED → IN_PROGRESS → SUBMITTED` and `→ CANCELLED` are ever actually triggered. `IN_REVIEW`, `REWORK_REQUIRED`, `APPROVED` transitions are defined in the table but **nothing in the app calls them yet** — that's Phase 8's job. |
| Evidence | `apps/api/src/modules/evidence`, `apps/web/src/features/evidence` | Presigned direct-to-S3 uploads, `HeadObject` server-side verification before persisting the DB row (rejects a "trust me it uploaded" call with no real file). Only `PHOTO` evidence is wired up in the UI — `VIDEO`/`DOCUMENT`/`SIGNATURE` exist in the `EvidenceType` enum but have no capture flow. |
| Offline / PWA | `apps/web/src/lib/db`, `apps/web/src/lib/offline`, `vite-plugin-pwa` config | Dexie-backed local queue for responses and evidence blobs; auto-flush on reconnect; Submit is deliberately **blocked while offline** (the blueprint's own design — local capture, online commit). No conflict detection at all yet — if the same question were edited on two devices, whichever syncs last just overwrites. That's explicitly Phase 7. |

### Data model additions not yet used by any feature
- `Inspection.reviewerId`, `clientVersion`, `serverVersion` — columns exist, nothing sets or reads them meaningfully yet (reviewer assignment is Phase 8, versioning is Phase 7's conflict detection).
- `InspectionResponse.clientVersion`/`serverVersion` — same story.

## 3. Known gotchas hit during the build (so you don't rediscover them)

- **`@fastify/cors` v11+ default `methods`** does not implicitly include `PUT`/`PATCH`/`DELETE`. It's set explicitly in `apps/api/src/app.ts` — if you ever touch that registration, keep the explicit `methods` array or every update/delete endpoint silently CORS-fails in the browser only (curl won't show it).
- **Dexie schema changes need a version bump**, not just editing the `.stores()` string — an already-created local IndexedDB won't pick up a new index otherwise, and querying a `.where()` on a non-indexed field throws a `SchemaError` that's easy to misread as unrelated. See `apps/web/src/lib/db/db.ts` for the v1→v2 migration pattern already in place.
- **MUI is on v9** (later than most tooling/docs assume as of this build): `InputLabelProps` was replaced by `slotProps={{ inputLabel: {...} }}`, and `Stack` doesn't accept top-level `justifyContent`/`alignItems`/`flexWrap` — they must go through `sx`. Some icon names need an explicit `Outlined` suffix that isn't obvious from the base icon name (e.g. `DeleteOutlineOutlined`, not `DeleteOutline`).
- **Neon (serverless Postgres) cold-starts**: the first query after a period of inactivity can take 1–3s. Not a bug, just don't be alarmed by an occasional slow first request in dev.
- **Fastify is on 5.12.1**, upgraded from 4.29.1 mid-build after `pnpm audit` found unpatched CVEs on the (now EOL) 4.x line. If you add more Fastify plugins, make sure they declare Fastify 5 support.

## 4. Remaining phases

### Phase 7 — Synchronization
Blueprint sections 11, 19, 25, 26.
- `sync_operations` and `devices` tables don't exist yet — add them per Section 19.
- `POST /sync/push`, `GET /sync/pull`, `POST /sync/resolve`, `GET /sync/status` endpoints don't exist — the offline queue built in Phase 6 currently talks to the *normal* REST endpoints directly (PUT /responses, POST /evidence), not a generic sync-operation endpoint. Decide whether to keep that (simpler, already works) or refactor onto the blueprint's generic sync-operation model (more faithful to the spec, more portfolio-visible "sync engine").
- Conflict detection needs `clientVersion`/`serverVersion` comparison — those columns exist on `Inspection` and `InspectionResponse` already but are never incremented or checked. Section 26's rules (server wins on assignment/review fields, latest-wins on unreviewed responses, evidence is additive) need actual implementation.
- Conflict-resolution UI (Section 7.12) doesn't exist.

### Phase 8 — Review Workflow
Blueprint sections 7.13–7.15, 24.
- New tables: `inspection_reviews`, `inspection_findings` (Section 17.3/17.4).
- Wire up the already-defined `SUBMITTED → IN_REVIEW → {APPROVED, REWORK_REQUIRED}` and `REWORK_REQUIRED → IN_PROGRESS` transitions in `inspection.service.ts` — the transition table already allows these, nothing calls them.
- Start enforcing `inspection.review` and `inspection.approve` permissions (currently unused).
- New screens: Supervisor Dashboard, Inspection Review (split layout), Rework Request.
- `reviewerId` on `Inspection` needs an actual assignment flow.

### Phase 9 — Analytics
Blueprint sections 7.13 (charts), 7.21, 7.22.
- `audit_events` table doesn't exist — Section 21's append-only audit log needs it, plus every mutation across every module needs to actually write to it. This is a meaningful cross-cutting change, not a small add-on — worth scoping carefully rather than bolting audit-writing onto every service ad hoc.
- Reports endpoints (`/reports/*`) don't exist. CSV export not implemented.
- Dashboard is currently a placeholder (`apps/web/src/features/dashboard/pages/DashboardPage.tsx`) — no charts, no real KPIs. Recharts is in the blueprint's suggested stack but not yet installed.

### Phase 10 — Production Polish
- **There is no automated test suite at all.** Every verification so far was manual: curl for the API, ad-hoc Playwright scripts written per-feature and deleted after confirming the behavior (per this session's practice of not leaving scratch scripts in the repo). Section 35's testing strategy (Vitest, RTL, Playwright as a permanent suite) has not been started. This is the single biggest gap before calling the project portfolio-ready — a reviewer will look for tests.
- No CI configured.
- No deployment target chosen yet (frontend/backend hosting were explicitly left as "decide later" back in initial setup).
- No structured logging beyond Fastify's default pino output.
- No rate-limit tuning beyond the values picked ad hoc during the security pass (login 5/min, refresh 20/min, evidence 30/min, global 100/min) — worth revisiting under real usage patterns.

## 5. Suggested order if resuming

Phase 7 and 8 are the more valuable/differentiating ones for the portfolio narrative (offline sync + conflict handling, and a real review workflow) — do those before Phase 9's analytics, which is comparatively generic. Phase 10's test suite is arguably overdue *now* rather than saved entirely for last — consider interleaving basic Vitest coverage for the state machine and RBAC logic (the two things most likely to silently regress) before piling on Phases 7–9.
