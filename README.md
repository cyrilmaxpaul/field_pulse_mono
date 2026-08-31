# FieldPulse — Offline-First Field Inspection & Evidence Platform

A production-style, mobile-first inspection platform built with React, TypeScript, Fastify, and PostgreSQL. FieldPulse lets organizations define versioned inspection templates, assign inspections to field workers, capture responses and photo evidence, and enforce the full inspection lifecycle server-side — from assignment through submission.

Built as a portfolio project demonstrating production-oriented engineering: real data modelling, RBAC, a versioned template engine, a server-enforced state machine, and presigned direct-to-storage file uploads — not just CRUD screens.

## Status

Phases 1–5 of the build are complete and verified end-to-end (backend + browser-tested UI). Offline support, synchronization, and the review/reporting workflow are in progress.

| Phase | Feature | Status |
|---|---|---|
| 1 | Auth (JWT + refresh rotation), base app shell | ✅ |
| 2 | Organizations, users, RBAC, sites | ✅ |
| 3 | Inspection templates, versioning, template builder | ✅ |
| 4 | Inspections, assignment, dynamic form, state machine | ✅ |
| 5 | Evidence capture, presigned uploads, evidence gallery | ✅ |
| 6 | Offline PWA, IndexedDB, local mutation queue | ⏳ next |
| 7 | Bidirectional sync, conflict detection | planned |
| 8 | Supervisor review workflow, rework/approval | planned |
| 9 | Analytics dashboard, reports, audit log | planned |
| 10 | Production polish, tests, deployment | planned |

## What's actually interesting here

- **Server-enforced inspection state machine** — `ASSIGNED → IN_PROGRESS → SUBMITTED → IN_REVIEW → APPROVED/REWORK_REQUIRED`, with every transition validated backend-side; invalid transitions are rejected, not just hidden in the UI.
- **Versioned inspection templates** — publishing locks a version; editing after publish clones a new draft rather than mutating history, so past inspections always point at the exact template version they were performed against.
- **RBAC without a fixed role list** — permissions are a data-driven catalog (`role → permission` join tables), not a hardcoded enum, so a "view all" vs "view own" access pattern falls out of the permission graph rather than being special-cased per endpoint.
- **Presigned evidence uploads with server-side verification** — the API never proxies file bytes; it issues a scoped, short-lived presigned URL for direct-to-storage upload, then verifies the object actually exists via a `HeadObject` call before persisting the record — a spoofed "upload complete" call with no real file is rejected.
- **Evidence-gated submission** — a question flagged `evidenceRequired` in the template blocks inspection submission until real evidence is attached, enforced in the same server-side validation path as required-answer checks.

## Tech stack

**Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, MUI

**Backend:** Node.js, TypeScript, Fastify, Prisma, PostgreSQL (Neon), Redis (Upstash), JWT

**Storage:** S3-compatible object storage (Supabase Storage) via presigned uploads

**Monorepo:** pnpm workspaces (`apps/web`, `apps/api`, `packages/shared-types`)

## Project structure

```text
fieldpulse/
├── apps/
│   ├── web/     # React + Vite frontend
│   └── api/     # Fastify + Prisma backend
├── packages/
│   └── shared-types/   # Types/constants shared across apps (e.g. the permission catalog)
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

## Getting started

```bash
pnpm install
pnpm prisma:push      # sync the schema to your Postgres database
pnpm db:seed          # creates a demo org + admin user
pnpm dev              # runs the API (:4000) and web app (:5173) together
```

Copy `.env.example` to `.env` and fill in your Postgres, Redis, and S3-compatible storage credentials first.

Seeded login: `admin@fieldpulse.dev` / `Password123!`
