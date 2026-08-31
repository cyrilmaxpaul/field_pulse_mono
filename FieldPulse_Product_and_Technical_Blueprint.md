# FieldPulse — Product & Technical Blueprint

> **Purpose:** Master blueprint for building FieldPulse as a production-style, offline-first field inspection platform using React + TypeScript + Node.js + PostgreSQL.
>
> **Primary goal:** Build a portfolio project that demonstrates strong frontend engineering, backend architecture, data modelling, offline synchronization, file handling, workflows, RBAC, auditability, and production-oriented thinking.

---

# 1. Product Overview

## 1.1 What is FieldPulse?

FieldPulse is a **mobile-first field inspection and evidence collection platform**.

Organizations use it to:

- Create and manage inspection sites.
- Define reusable inspection templates.
- Assign inspections to field workers.
- Allow workers to perform inspections from mobile devices.
- Continue working when the internet is unavailable.
- Capture notes, checklist responses, photos, and evidence.
- Synchronize offline changes when connectivity returns.
- Review submitted inspections.
- Request rework or approve inspections.
- Track a complete audit history.
- Generate reports and operational analytics.

### Example use cases

The platform can support:

- Construction site inspections
- Building safety inspections
- Electrical inspections
- Solar installation inspections
- Equipment inspections
- Property inspections
- Quality-control inspections
- Maintenance inspections

FieldPulse should remain **industry-neutral**. The demo data can use construction/property inspection examples, but the underlying architecture should be configurable.

---

# 2. Product Roles

## 2.1 Organization Admin

Responsible for configuration.

Permissions:

- Manage organization
- Manage users
- Manage roles
- Manage sites
- Manage inspection templates
- View all inspections
- View reports
- View audit logs
- Manage settings

## 2.2 Supervisor / Reviewer

Responsible for operational review.

Permissions:

- View assigned teams
- Create/assign inspections
- Review submissions
- Approve inspections
- Reject/request rework
- View evidence
- View dashboards
- View reports

## 2.3 Field Worker

Responsible for performing inspections.

Permissions:

- View assigned inspections
- Download inspection data for offline use
- Start inspections
- Fill inspection forms
- Capture evidence
- Add notes
- Submit inspections
- View sync status
- Resolve permitted sync conflicts

## 2.4 Auditor / Read-only User

Permissions:

- View inspections
- View evidence
- View audit history
- View reports

No mutation permissions.

---

# 3. Core Product Concepts

```text
Organization
    |
    +-- Users
    |
    +-- Sites
    |     |
    |     +-- Assets / Areas
    |
    +-- Inspection Templates
    |     |
    |     +-- Sections
    |           |
    |           +-- Questions
    |
    +-- Inspections
          |
          +-- Responses
          +-- Evidence
          +-- Review
          +-- Audit Events
          +-- Sync History
```

---

# 4. Application Navigation

## 4.1 Desktop Navigation

```text
FieldPulse
│
├── Dashboard
├── Inspections
│   ├── All Inspections
│   ├── My Inspections
│   ├── Pending Review
│   └── Completed
│
├── Sites
├── Templates
├── Team
├── Evidence
├── Reports
├── Audit Log
│
└── Settings
    ├── Organization
    ├── Users
    ├── Roles & Permissions
    ├── Inspection Settings
    └── System Settings
```

## 4.2 Mobile Navigation

Keep mobile navigation intentionally smaller:

```text
Home
Inspections
Sync
Notifications
Profile
```

Secondary actions should live inside screens rather than making the mobile navigation crowded.

---

# 5. Global UI Principles

## 5.1 Responsive strategy

The same React application should support:

- Mobile: 360px+
- Tablet: 768px+
- Desktop: 1024px+
- Large desktop: 1440px+

Do not simply shrink desktop screens.

Mobile should be treated as a **first-class field-worker experience**.

## 5.2 Mobile priorities

Large touch targets:

- Buttons
- Checkbox controls
- Camera/upload actions
- Save
- Next/Previous
- Submit

Avoid dense tables on mobile.

Use:

- Cards
- Bottom sheets
- Drawers
- Sticky action bars
- Step indicators

## 5.3 Desktop priorities

Desktop is optimized for:

- Supervisors
- Admins
- Reviewers
- Reporting

Use:

- Data tables
- Side navigation
- Multi-column layouts
- Filters
- Bulk actions
- Analytics
- Review panels

---

# 6. Screen Inventory

## Authentication

1. Login
2. Forgot Password
3. Reset Password
4. First-time Password Setup
5. Session Expired

## Field Worker

6. Mobile Home
7. My Inspections
8. Inspection Details
9. Inspection Form
10. Question Evidence Capture
11. Evidence Gallery
12. Inspection Summary
13. Submit Inspection
14. Offline Mode
15. Sync Center
16. Sync Conflict Resolution
17. Notifications
18. Profile

## Supervisor

19. Supervisor Dashboard
20. Inspection List
21. Inspection Review
22. Rework Request
23. Team View
24. Site Overview
25. Evidence Review

## Admin

26. Admin Dashboard
27. Users
28. User Details
29. Sites
30. Site Details
31. Inspection Templates
32. Template Builder
33. Template Preview
34. Roles & Permissions
35. Audit Log
36. Reports
37. Organization Settings
38. System Settings

---

# 7. Detailed UI Specifications

# 7.1 Login

### Purpose

Authenticate the user.

### Layout

Desktop:

```text
+----------------------+-------------------------+
|                      |                         |
|    FieldPulse logo   |       Login             |
|                      |                         |
|    Product message   | Email                   |
|                      | [___________________]   |
|                      |                         |
|                      | Password                |
|                      | [___________________]   |
|                      |                         |
|                      | [       Login       ]   |
|                      |                         |
|                      | Forgot password?        |
|                      |                         |
+----------------------+-------------------------+
```

Mobile:

Single-column form.

### States

- Empty
- Validation error
- Loading
- Invalid credentials
- Network unavailable
- Session expired

---

# 7.2 Mobile Home

The worker's primary landing screen.

### Sections

```text
Header
    Greeting
    Sync indicator
    Notification icon

Today's Work
    Assigned count
    Pending count
    Completed count

Next Inspection
    Site
    Time
    Distance
    Status
    Start button

My Inspections
    Inspection cards

Offline Status
    Last successful sync
    Pending changes
```

### Example card

```text
┌─────────────────────────────┐
│ Building A                  │
│ Safety Inspection           │
│                             │
│ Today · 10:00 AM            │
│                             │
│ 12 / 18 checks completed    │
│                             │
│ [ Continue Inspection ]     │
└─────────────────────────────┘
```

---

# 7.3 My Inspections

### Filters

- All
- Assigned
- In Progress
- Pending Sync
- Submitted
- Rework Required
- Completed

### Mobile

Cards.

### Desktop

Table:

| Inspection | Site | Worker | Status | Due | Updated |
|---|---|---|---|---|---|

### Search

Search by:

- Inspection ID
- Site
- Worker
- Template

---

# 7.4 Inspection Details

### Header

```text
Inspection #FP-000124
Safety Inspection
Building A
```

### Information

- Site
- Address
- Assigned worker
- Supervisor
- Scheduled date
- Due date
- Template
- Status
- Last synced

### Progress

```text
██████████████░░░░ 78%
14 / 18 sections completed
```

### Actions

Worker:

- Start
- Continue
- Submit

Supervisor:

- Review
- Request Rework
- Approve

---

# 7.5 Inspection Form

This is the **most important mobile screen**.

### Structure

```text
Inspection
────────────────────────────

Section 3 of 8

Electrical Safety

[✓] Main panel accessible
[✓] Wiring properly secured
[ ] Emergency shutoff labeled
[ ] No exposed conductors

Notes
[________________________]

Evidence
[ + Add Photo ]

────────────────────────────
[ Back ]       [ Save & Next ]
```

### Question types

Support:

- Yes / No
- Pass / Fail
- Checkbox
- Single select
- Multi select
- Text
- Number
- Decimal
- Date
- Time
- Rating
- Measurement
- Photo required
- Signature

### Conditional questions

Example:

```text
Question:
Is there visible damage?

Answer:
YES

        ↓

Show:

Describe damage
[____________]

Upload evidence
[ + Photo ]
```

---

# 7.6 Evidence Capture

Evidence can be attached to:

- Inspection
- Section
- Question
- Finding

### Evidence types

- Photo
- Video
- Document
- Note
- Signature

### Mobile actions

```text
[ 📷 Take Photo ]

[ 🖼 Choose from Gallery ]

[ 📎 Attach File ]
```

### Photo workflow

```text
Capture
  ↓
Preview
  ↓
Optional annotation
  ↓
Compress
  ↓
Store locally
  ↓
Mark pending upload
  ↓
Upload during sync
```

---

# 7.7 Evidence Gallery

Grid view:

```text
┌─────┬─────┬─────┐
│ IMG │ IMG │ IMG │
├─────┼─────┼─────┤
│ IMG │ IMG │ IMG │
└─────┴─────┴─────┘
```

Each item shows:

- Upload status
- Question reference
- Timestamp
- Created by

Statuses:

- Local only
- Uploading
- Uploaded
- Failed

---

# 7.8 Inspection Summary

Before submission:

```text
Inspection Summary

Progress
18 / 18 completed

Critical findings
2

Evidence
14 files

Notes
6

Validation
✓ All required questions answered
✓ Required evidence attached
✓ Worker signature added

[ Save Draft ]
[ Submit Inspection ]
```

---

# 7.9 Submit Inspection

Use a confirmation screen rather than instantly submitting.

```text
Ready to submit?

Once submitted:
• Editing may be restricted.
• Supervisor will be notified.
• Your pending changes will sync.

[ Cancel ]

[ Submit ]
```

If offline:

```text
No internet connection.

Your inspection will be saved locally and
submitted automatically when connectivity returns.

[ Save & Queue for Sync ]
```

---

# 7.10 Sync Center

This is a major differentiating feature.

### Screen

```text
Sync Center

Connection
🟢 Online

Last successful sync
Today 10:32 AM

Pending changes
7

Uploads
3

Downloads
2

Failed
1

[ Sync Now ]
```

### Sync item

```text
Inspection #FP-1024
Updated locally

Status: Waiting to sync

██████████░░ 80%
```

---

# 7.11 Offline Mode

When offline, show a persistent but non-blocking indicator.

Example:

```text
┌─────────────────────────────┐
│ ⚡ Offline                  │
│ Changes are saved locally. │
└─────────────────────────────┘
```

Do not prevent the worker from performing already downloaded work.

---

# 7.12 Sync Conflict Resolution

Only show this when a true conflict occurs.

```text
Sync Conflict

Inspection #FP-1024

Server version:
Status → Requires Rework

Your offline version:
3 new photos
2 updated answers

Choose:

[ Keep Server ]

[ Keep My Changes ]

[ Review & Merge ]
```

For the portfolio implementation, start with deterministic field-level conflict rules before implementing a complex merge engine.

---

# 7.13 Supervisor Dashboard

Desktop-first.

### KPI cards

```text
Total Inspections       128
In Progress              24
Pending Review           17
Completed                82
Rework Required           5
```

### Charts

- Inspections by status
- Inspections over time
- Completion rate
- Average inspection duration
- Rework rate
- Worker performance
- Site issue distribution

### Recent activity

```text
Arun submitted Inspection #124
Priya requested rework on #119
Kumar started Inspection #127
```

---

# 7.14 Inspection Review

Use a split layout on desktop.

```text
+----------------------+---------------------------+
| Inspection Sections  | Review Panel              |
|                      |                           |
| ✓ Site Information   | Question                  |
| ✓ Safety             | Main panel accessible?    |
| ⚠ Electrical         |                           |
| ✓ Equipment          | Answer: YES               |
|                      |                           |
|                      | Evidence                  |
|                      | [Photo] [Photo]           |
|                      |                           |
|                      | Reviewer comment          |
|                      | [____________________]    |
+----------------------+---------------------------+
```

Reviewer can:

- Approve
- Request Rework
- Add comment
- Flag finding
- View evidence
- View audit history

---

# 7.15 Rework Request

Reviewer chooses:

```text
Section
Question
Reason
Comment
Required action
```

Example:

```text
Section:
Electrical Safety

Question:
Emergency shutoff labeled?

Reason:
Insufficient evidence

Comment:
Please upload a clear photo of the label.

[ Request Rework ]
```

Worker sees the exact items requiring correction.

---

# 7.16 Sites

Desktop table:

| Site | Code | Location | Active Inspections | Status |
|---|---|---|---:|---|

Actions:

- View
- Edit
- Archive

---

# 7.17 Site Details

Sections:

```text
Overview
Address
Contacts
Assets / Areas
Inspection History
Open Findings
Documents
Activity
```

---

# 7.18 Inspection Templates

List reusable templates.

Columns:

- Name
- Version
- Sections
- Questions
- Status
- Created
- Updated

Actions:

- Preview
- Edit
- Duplicate
- Publish
- Archive

---

# 7.19 Template Builder

This is another major frontend showcase.

### Builder layout

```text
+----------------+----------------------+----------------+
| Components     | Template             | Properties     |
|                |                      |                |
| Text           | Section 1            | Question       |
| Number         |   Question 1         | Type: Select   |
| Select         |   Question 2         | Required: Yes  |
| Checkbox       |                      | Options        |
| Photo          | Section 2            | Conditions     |
| Rating         |   Question 3         | Evidence       |
|                |                      |                |
+----------------+----------------------+----------------+
```

### Features

- Add section
- Add question
- Reorder
- Drag/drop
- Duplicate
- Required toggle
- Conditional visibility
- Validation rules
- Evidence requirement
- Preview

---

# 7.20 Team Management

Show:

- User
- Role
- Status
- Assigned sites
- Active inspections
- Last activity

Actions:

- Add user
- Edit user
- Deactivate
- Reset password
- Assign sites

---

# 7.21 Audit Log

Immutable timeline.

Example:

```text
10:31  Inspection created
10:42  Evidence uploaded
11:02  Inspection started
11:27  Question updated
11:31  Submitted
11:40  Reviewer assigned
12:05  Rework requested
12:31  Resubmitted
```

Filters:

- User
- Entity
- Action
- Date
- Inspection
- Site

---

# 7.22 Reports

Reports should provide:

- Inspection completion
- Rework rate
- Average duration
- Findings by category
- Site performance
- Worker workload
- Evidence statistics

Export:

- CSV
- PDF

For the first version, server-generated CSV is sufficient.

---

# 8. Frontend Folder Structure

Recommended structure:

```text
apps/
└── web/
    ├── public/
    │   ├── icons/
    │   └── manifest.webmanifest
    │
    └── src/
        ├── app/
        │   ├── router/
        │   ├── providers/
        │   ├── layouts/
        │   └── App.tsx
        │
        ├── assets/
        │
        ├── components/
        │   ├── ui/
        │   ├── forms/
        │   ├── data-table/
        │   ├── charts/
        │   ├── feedback/
        │   └── navigation/
        │
        ├── features/
        │   ├── auth/
        │   ├── dashboard/
        │   ├── inspections/
        │   ├── templates/
        │   ├── sites/
        │   ├── evidence/
        │   ├── team/
        │   ├── reports/
        │   ├── audit/
        │   ├── notifications/
        │   └── sync/
        │
        ├── hooks/
        │
        ├── lib/
        │   ├── api/
        │   ├── db/
        │   ├── offline/
        │   ├── storage/
        │   └── utils/
        │
        ├── routes/
        │
        ├── stores/
        │
        ├── types/
        │
        ├── config/
        │
        └── main.tsx
```

---

# 9. Feature Folder Pattern

Each major feature should be self-contained.

Example:

```text
features/
└── inspections/
    ├── api/
    │   ├── getInspections.ts
    │   ├── getInspection.ts
    │   ├── createInspection.ts
    │   └── submitInspection.ts
    │
    ├── components/
    │   ├── InspectionCard.tsx
    │   ├── InspectionStatus.tsx
    │   ├── InspectionProgress.tsx
    │   └── InspectionFilters.tsx
    │
    ├── hooks/
    │   ├── useInspection.ts
    │   └── useInspectionMutations.ts
    │
    ├── pages/
    │   ├── InspectionListPage.tsx
    │   ├── InspectionDetailsPage.tsx
    │   ├── InspectionFormPage.tsx
    │   └── InspectionReviewPage.tsx
    │
    ├── schemas/
    │
    ├── types/
    │
    └── index.ts
```

---

# 10. Offline Architecture

The browser needs a local data layer.

Recommended:

```text
React
  |
TanStack Query
  |
Application Service
  |
Offline Repository
  |
IndexedDB
```

Use IndexedDB for:

- Assigned inspections
- Templates
- Questions
- Responses
- Local evidence metadata
- Sync queue
- User session metadata

Use a library such as Dexie to make IndexedDB easier to manage.

---

# 11. Sync Architecture

## 11.1 Local mutation

```text
User changes answer
       |
       v
Update IndexedDB
       |
       v
Create sync operation
       |
       v
SYNC_PENDING
```

## 11.2 Online sync

```text
Network restored
       |
       v
Sync Manager
       |
       v
Read pending operations
       |
       v
Send operation to API
       |
       +---- success ---> mark synced
       |
       +---- conflict --> conflict queue
       |
       +---- error -----> retry
```

## 11.3 Sync operation example

```text
{
  id: "sync-123",
  entity: "inspection_response",
  entityId: "response-456",
  operation: "UPDATE",
  payload: {},
  clientVersion: 4,
  createdAt: "...",
  retryCount: 0,
  status: "PENDING"
}
```

---

# 12. Backend Architecture

Recommended stack:

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Prisma
- Redis
- BullMQ
- S3-compatible object storage

---

# 13. Backend Folder Structure

```text
apps/
└── api/
    └── src/
        ├── config/
        │   ├── env.ts
        │   ├── database.ts
        │   └── redis.ts
        │
        ├── modules/
        │   ├── auth/
        │   ├── users/
        │   ├── organizations/
        │   ├── sites/
        │   ├── templates/
        │   ├── inspections/
        │   ├── evidence/
        │   ├── reviews/
        │   ├── notifications/
        │   ├── reports/
        │   ├── audit/
        │   └── sync/
        │
        ├── middleware/
        │   ├── auth.ts
        │   ├── permissions.ts
        │   ├── errorHandler.ts
        │   └── requestId.ts
        │
        ├── plugins/
        │   ├── prisma.ts
        │   ├── redis.ts
        │   └── swagger.ts
        │
        ├── queues/
        │   ├── inspection.queue.ts
        │   ├── evidence.queue.ts
        │   ├── notification.queue.ts
        │   └── report.queue.ts
        │
        ├── services/
        │   ├── storage/
        │   ├── notification/
        │   └── sync/
        │
        ├── utils/
        │
        ├── types/
        │
        ├── app.ts
        └── server.ts
```

---

# 14. Backend Module Pattern

Example:

```text
modules/
└── inspections/
    ├── inspection.controller.ts
    ├── inspection.service.ts
    ├── inspection.repository.ts
    ├── inspection.routes.ts
    ├── inspection.schema.ts
    ├── inspection.types.ts
    └── inspection.mapper.ts
```

### Responsibilities

Controller:

- Parse request
- Call service
- Return response

Service:

- Business logic
- Workflow rules
- Transactions

Repository:

- Database access

Schema:

- Request validation

Mapper:

- Convert DB models to API DTOs

---

# 15. Database Overview

PostgreSQL is the primary relational database.

High-level entities:

```text
organizations
    |
    +-- users
    +-- roles
    +-- sites
    +-- templates
    +-- inspections
    +-- notifications
    +-- audit_events

sites
    |
    +-- assets

templates
    |
    +-- template_versions
          |
          +-- sections
                |
                +-- questions

inspections
    |
    +-- responses
    +-- evidence
    +-- reviews
    +-- findings
    +-- audit_events
```

---

# 16. Database Tables

## 16.1 organizations

```text
organizations
--------------
id UUID PK
name VARCHAR
slug VARCHAR UNIQUE
status ENUM
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 16.2 users

```text
users
-----
id UUID PK
organization_id UUID FK
first_name VARCHAR
last_name VARCHAR
email VARCHAR UNIQUE
password_hash VARCHAR
status ENUM
last_login_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

Indexes:

```text
organization_id
email
status
```

---

# 16.3 roles

```text
roles
-----
id UUID PK
organization_id UUID FK
name VARCHAR
description TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 16.4 permissions

```text
permissions
-----------
id UUID PK
key VARCHAR UNIQUE
description TEXT
```

Example:

```text
inspection.read
inspection.create
inspection.update
inspection.submit
inspection.review
inspection.approve
site.manage
user.manage
report.read
audit.read
```

---

# 16.5 role_permissions

```text
role_permissions
----------------
role_id UUID FK
permission_id UUID FK

PRIMARY KEY(role_id, permission_id)
```

---

# 16.6 user_roles

```text
user_roles
----------
user_id UUID FK
role_id UUID FK

PRIMARY KEY(user_id, role_id)
```

---

# 16.7 sites

```text
sites
-----
id UUID PK
organization_id UUID FK
name VARCHAR
code VARCHAR
description TEXT
address_line_1 VARCHAR
address_line_2 VARCHAR
city VARCHAR
state VARCHAR
country VARCHAR
postal_code VARCHAR
latitude DECIMAL
longitude DECIMAL
status ENUM
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 16.8 site_members

```text
site_members
------------
site_id UUID FK
user_id UUID FK
role VARCHAR

PRIMARY KEY(site_id, user_id)
```

---

# 16.9 assets

Optional site-specific inspection targets.

```text
assets
------
id UUID PK
site_id UUID FK
name VARCHAR
asset_code VARCHAR
asset_type VARCHAR
description TEXT
status ENUM
metadata JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 16.10 inspection_templates

```text
inspection_templates
--------------------
id UUID PK
organization_id UUID FK
name VARCHAR
description TEXT
status ENUM
current_version_id UUID
created_by UUID FK
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 16.11 template_versions

Templates must be versioned.

```text
template_versions
-----------------
id UUID PK
template_id UUID FK
version_number INTEGER
status ENUM
published_at TIMESTAMP
created_by UUID FK
created_at TIMESTAMP
```

Unique:

```text
(template_id, version_number)
```

---

# 16.12 template_sections

```text
template_sections
-----------------
id UUID PK
template_version_id UUID FK
title VARCHAR
description TEXT
display_order INTEGER
```

---

# 16.13 template_questions

```text
template_questions
------------------
id UUID PK
section_id UUID FK
question_key VARCHAR
label TEXT
description TEXT
question_type ENUM
is_required BOOLEAN
display_order INTEGER
validation_rules JSONB
options JSONB
conditional_rules JSONB
evidence_required BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

`JSONB` is useful here because form configuration can vary by question type.

---

# 17. Inspection Tables

## 17.1 inspections

```text
inspections
-----------
id UUID PK
organization_id UUID FK
site_id UUID FK
asset_id UUID FK NULL
template_version_id UUID FK
assigned_to UUID FK
reviewer_id UUID FK NULL

status ENUM

scheduled_at TIMESTAMP
started_at TIMESTAMP NULL
submitted_at TIMESTAMP NULL
completed_at TIMESTAMP NULL

client_version INTEGER DEFAULT 0
server_version INTEGER DEFAULT 0

created_at TIMESTAMP
updated_at TIMESTAMP
```

Suggested statuses:

```text
ASSIGNED
IN_PROGRESS
PENDING_SYNC
SUBMITTED
IN_REVIEW
REWORK_REQUIRED
APPROVED
CANCELLED
```

---

# 17.2 inspection_responses

```text
inspection_responses
--------------------
id UUID PK
inspection_id UUID FK
question_id UUID FK

value JSONB

client_version INTEGER
server_version INTEGER

answered_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

Why JSONB?

Different questions have different answer shapes:

```text
YES/NO:
true

NUMBER:
42

MULTI_SELECT:
["helmet", "gloves"]

TEXT:
"Minor corrosion observed"

RATING:
4
```

---

# 17.3 inspection_findings

```text
inspection_findings
-------------------
id UUID PK
inspection_id UUID FK
question_id UUID FK NULL
severity ENUM
title VARCHAR
description TEXT
status ENUM
created_by UUID FK
resolved_at TIMESTAMP NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

Severity:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 17.4 inspection_reviews

```text
inspection_reviews
------------------
id UUID PK
inspection_id UUID FK
reviewer_id UUID FK
decision ENUM
comment TEXT
created_at TIMESTAMP
```

Decision:

```text
APPROVED
REWORK_REQUIRED
```

---

# 18. Evidence Tables

## 18.1 evidence

```text
evidence
--------
id UUID PK
organization_id UUID FK
inspection_id UUID FK
question_id UUID FK NULL

type ENUM

storage_key VARCHAR
file_name VARCHAR
mime_type VARCHAR
file_size BIGINT

checksum VARCHAR

latitude DECIMAL NULL
longitude DECIMAL NULL
captured_at TIMESTAMP NULL

uploaded_by UUID FK

status ENUM

created_at TIMESTAMP
updated_at TIMESTAMP
```

Types:

```text
PHOTO
VIDEO
DOCUMENT
SIGNATURE
NOTE
```

Statuses:

```text
PENDING_UPLOAD
UPLOADING
UPLOADED
FAILED
DELETED
```

---

# 19. Sync Tables

## 19.1 sync_operations

The server keeps a record of synchronization operations.

```text
sync_operations
---------------
id UUID PK
user_id UUID FK
device_id VARCHAR
entity_type VARCHAR
entity_id UUID
operation ENUM
client_version INTEGER
payload JSONB
status ENUM
error_code VARCHAR NULL
error_message TEXT NULL
created_at TIMESTAMP
processed_at TIMESTAMP NULL
```

Operations:

```text
CREATE
UPDATE
DELETE
```

Statuses:

```text
PENDING
PROCESSING
COMPLETED
CONFLICT
FAILED
```

---

# 19.2 devices

```text
devices
-------
id UUID PK
user_id UUID FK
device_id VARCHAR
device_name VARCHAR
platform VARCHAR
app_version VARCHAR
last_sync_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

A user may have multiple devices.

---

# 20. Notifications

## notifications

```text
notifications
-------------
id UUID PK
user_id UUID FK
type VARCHAR
title VARCHAR
message TEXT
data JSONB
read_at TIMESTAMP NULL
created_at TIMESTAMP
```

Examples:

```text
INSPECTION_ASSIGNED
INSPECTION_REVIEWED
REWORK_REQUESTED
INSPECTION_APPROVED
SYNC_FAILED
```

---

# 21. Audit Log

## audit_events

```text
audit_events
------------
id UUID PK
organization_id UUID FK
user_id UUID FK NULL

entity_type VARCHAR
entity_id UUID

action VARCHAR

before_data JSONB NULL
after_data JSONB NULL

ip_address INET NULL
user_agent TEXT NULL

created_at TIMESTAMP
```

Important principle:

**Audit events should be append-only.**

Do not update historical audit records.

---

# 22. Database Relationship Summary

```text
organizations
    |
    +---------------- users
    |                    |
    |                    +--- user_roles --- roles --- role_permissions --- permissions
    |
    +---------------- sites
    |                    |
    |                    +--- site_members
    |                    +--- assets
    |
    +---------------- templates
    |                    |
    |                    +--- template_versions
    |                            |
    |                            +--- template_sections
    |                                    |
    |                                    +--- template_questions
    |
    +---------------- inspections
                         |
                         +--- inspection_responses
                         +--- inspection_findings
                         +--- inspection_reviews
                         +--- evidence
                         +--- audit_events
```

---

# 23. API Structure

Base:

```text
/api/v1
```

## Authentication

```text
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
```

## Users

```text
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

## Sites

```text
GET    /sites
POST   /sites
GET    /sites/:id
PATCH  /sites/:id
DELETE /sites/:id
```

## Templates

```text
GET    /templates
POST   /templates
GET    /templates/:id
PATCH  /templates/:id
POST   /templates/:id/duplicate
POST   /templates/:id/publish
POST   /templates/:id/archive

GET    /templates/:id/versions
GET    /templates/:id/preview
```

## Inspections

```text
GET    /inspections
POST   /inspections
GET    /inspections/:id
PATCH  /inspections/:id
POST   /inspections/:id/start
POST   /inspections/:id/submit
POST   /inspections/:id/cancel
POST   /inspections/:id/reopen
```

## Responses

```text
PUT    /inspections/:id/responses/:questionId
GET    /inspections/:id/responses
```

## Reviews

```text
POST   /inspections/:id/review
POST   /inspections/:id/rework
POST   /inspections/:id/approve
GET    /inspections/:id/reviews
```

## Evidence

```text
POST   /evidence/presign
POST   /evidence
GET    /inspections/:id/evidence
DELETE /evidence/:id
```

## Sync

```text
POST   /sync/push
GET    /sync/pull
POST   /sync/resolve
GET    /sync/status
```

## Reports

```text
GET /reports/inspection-summary
GET /reports/site-performance
GET /reports/worker-performance
GET /reports/findings
GET /reports/export
```

---

# 24. Important Backend Flows

# 24.1 Create Inspection

```text
Supervisor
   |
   v
POST /inspections
   |
Validate request
   |
Check permission
   |
Check site
   |
Check template version
   |
Create inspection
   |
Create audit event
   |
Create notification
   |
Return inspection
```

---

# 24.2 Start Inspection

```text
Worker
   |
   v
Start inspection
   |
Check assignment
   |
Check status
   |
Update started_at
   |
Status = IN_PROGRESS
   |
Audit event
```

---

# 24.3 Submit Inspection Online

```text
Worker
   |
   v
Validate required questions
   |
Validate required evidence
   |
Validate inspection state
   |
Transaction
   |
   +-- Update inspection
   +-- Create submission event
   +-- Create audit event
   +-- Create reviewer notification
   |
Commit
```

---

# 24.4 Submit Inspection Offline

```text
Worker
   |
   v
React App
   |
IndexedDB
   |
Create local sync operation
   |
Status = PENDING_SYNC
   |
Worker continues using app
   |
Internet restored
   |
Sync Manager
   |
POST /sync/push
```

---

# 25. Sync Flow

## Push

Client sends:

```text
{
  deviceId,
  operations: [
    {
      entityType: "inspection_response",
      entityId: "...",
      operation: "UPDATE",
      clientVersion: 4,
      payload: {}
    }
  ]
}
```

Server:

```text
Authenticate
    |
Validate device
    |
For each operation
    |
Compare clientVersion
    |
    +-- Same expected version --> apply
    |
    +-- Version mismatch ------> conflict
```

---

# 26. Conflict Strategy

Do not attempt a universal conflict resolver initially.

Use explicit rules.

## Inspection metadata

Server wins for:

- Assignment
- Reviewer
- Approval status

## Worker response

Latest valid client change can win if server response has not been reviewed.

## Evidence

Usually additive.

If both sides add photos:

```text
Server photos
+
Client photos
=
Merged set
```

## Reviewed inspection

Once an inspection enters final review/approval:

- Worker mutations are restricted.
- Rework creates a new editable state.

---

# 27. Background Jobs

Use BullMQ/Redis for work that should not block HTTP requests.

Queues:

```text
inspection-processing
evidence-processing
notifications
reports
```

Examples:

### Evidence processing

```text
Upload
  |
Queue
  |
Worker
  |
Validate file
  |
Generate thumbnail
  |
Extract metadata
  |
Mark processed
```

### Notification

```text
Inspection submitted
       |
       v
Notification Queue
       |
       v
Worker
       |
       +-- In-app notification
       +-- Optional email
```

### Reports

```text
User requests report
       |
       v
Create report job
       |
       v
Worker
       |
Generate CSV/PDF
       |
Store file
       |
Notify user
```

---

# 28. File Storage

Do not store large files directly inside PostgreSQL.

Use S3-compatible object storage.

Example:

```text
storage/
  organizations/
    {organizationId}/
      inspections/
        {inspectionId}/
          evidence/
            {evidenceId}.jpg
```

Development can use MinIO.

Production can use Amazon S3 or another compatible provider.

---

# 29. Security

Implement:

- Password hashing
- JWT access tokens
- Refresh token rotation
- RBAC
- Organization-level data isolation
- Input validation
- File type validation
- File size limits
- Rate limiting
- CORS
- Secure HTTP headers
- Audit logging

Never trust:

- User ID from client
- Organization ID from client
- Permission claims without server validation

Derive authorization from authenticated server-side context.

---

# 30. Multi-Tenant Data Isolation

Every organization-owned table should have:

```text
organization_id
```

The API should automatically scope queries.

Bad:

```text
SELECT * FROM inspections WHERE id = ?
```

Better:

```text
SELECT *
FROM inspections
WHERE id = ?
AND organization_id = ?
```

This is important for demonstrating production-grade thinking.

---

# 31. Error Handling

Use a consistent API response.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "INSPECTION_NOT_EDITABLE",
    "message": "This inspection cannot be edited in its current state."
  }
}
```

Validation:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "fields": {
      "email": "Invalid email address."
    }
  }
}
```

---

# 32. State Machines

Avoid scattered status logic.

Inspection lifecycle:

```text
ASSIGNED
   |
   v
IN_PROGRESS
   |
   v
SUBMITTED
   |
   v
IN_REVIEW
   |
   +----> REWORK_REQUIRED
   |              |
   |              v
   |          IN_PROGRESS
   |
   v
APPROVED
```

Invalid transitions should be rejected by the backend.

Example:

```text
APPROVED → IN_PROGRESS
```

must not be allowed.

---

# 33. Frontend State Strategy

Separate server state from local UI state.

### Server state

Use TanStack Query:

- Inspections
- Sites
- Templates
- Users
- Notifications
- Reports

### Local application state

Use a lightweight store where appropriate:

- Current inspection session
- UI preferences
- Sidebar state
- Sync indicators

### Offline state

IndexedDB should be the source of truth for offline inspection work.

Do not use localStorage for large inspection datasets or evidence metadata.

---

# 34. PWA Requirements

Include:

```text
manifest.webmanifest
service worker
offline fallback
install prompt
cache strategy
network status detection
```

Cache:

- Application shell
- Static assets
- Appropriate read-only data

Do not blindly cache sensitive API responses forever.

---

# 35. Testing Strategy

## Frontend

Unit:

- Form validation
- Sync queue
- Conflict logic
- Utility functions

Component:

- Inspection form
- Question rendering
- Evidence uploader
- Sync indicator

E2E:

```text
Login
  ↓
Open inspection
  ↓
Fill form
  ↓
Attach evidence
  ↓
Go offline
  ↓
Continue editing
  ↓
Reconnect
  ↓
Sync
  ↓
Submit
```

## Backend

Test:

- Authentication
- Permissions
- Inspection transitions
- Template validation
- Sync operations
- Conflict handling
- Evidence authorization

---

# 36. Recommended Development Phases

Do not build everything at once.

## Phase 1 — Foundation

Build:

- Monorepo
- React app
- Node API
- PostgreSQL
- Prisma
- Authentication
- Basic layout
- Docker setup

## Phase 2 — Core Admin

Build:

- Organizations
- Users
- Roles
- Sites
- Permissions

## Phase 3 — Template Engine

Build:

- Templates
- Versions
- Sections
- Questions
- Template builder
- Preview

## Phase 4 — Inspection Engine

Build:

- Create inspection
- Assign worker
- Inspection details
- Dynamic form renderer
- Responses
- Status lifecycle

## Phase 5 — Evidence

Build:

- Photo upload
- File storage
- Evidence gallery
- Metadata
- Upload states

## Phase 6 — Offline

Build:

- PWA
- IndexedDB
- Offline inspection cache
- Local mutations
- Sync queue
- Online/offline detection

## Phase 7 — Synchronization

Build:

- Push
- Pull
- Versioning
- Retry
- Conflict detection
- Conflict resolution UI

## Phase 8 — Review Workflow

Build:

- Reviewer dashboard
- Review screen
- Findings
- Rework
- Approval

## Phase 9 — Analytics

Build:

- Dashboard
- Reports
- Charts
- CSV export

## Phase 10 — Production Polish

Build:

- Tests
- Error handling
- Logging
- Rate limiting
- Audit trail
- Performance optimization
- Documentation
- Deployment

---

# 37. MVP Scope

If the project starts becoming too large, stop at this MVP:

### Must have

- Authentication
- Users/Roles
- Sites
- Inspection templates
- Template builder
- Assign inspection
- Mobile inspection form
- Photo evidence
- PostgreSQL
- Offline inspection
- IndexedDB
- Sync queue
- Supervisor review
- Audit log
- Responsive dashboard

### Nice to have

- Conflict resolution UI
- Background workers
- Reports
- PDF generation
- Push notifications
- Advanced analytics
- Map integration

---

# 38. Suggested Tech Stack

## Frontend

```text
React
TypeScript
Vite
React Router
TanStack Query
React Hook Form
Zod
MUI
Dexie
Workbox / service worker
Recharts
```

## Backend

```text
Node.js
TypeScript
Fastify
Prisma
PostgreSQL
Redis
BullMQ
JWT
Zod
Swagger/OpenAPI
```

## Infrastructure

```text
Docker
Docker Compose
MinIO
Redis
PostgreSQL
```

## Testing

```text
Vitest
React Testing Library
Playwright
```

---

# 39. Recommended Monorepo

```text
fieldpulse/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── shared-types/
│   ├── validation/
│   ├── eslint-config/
│   └── tsconfig/
│
├── workers/
│   └── processor/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── offline-sync.md
│   └── decisions/
│
├── docker/
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

# 40. Git Commit Strategy

Avoid commits such as:

```text
fix stuff
changes
final
updated
```

Use meaningful commits:

```text
feat(auth): add JWT authentication
feat(sites): add site management
feat(templates): add template builder
feat(inspections): add dynamic inspection renderer
feat(evidence): add photo evidence upload
feat(offline): add IndexedDB inspection storage
feat(sync): add pending operation queue
feat(sync): add conflict detection
feat(review): add inspection review workflow
feat(reports): add inspection analytics
```

This makes the Git history itself demonstrate engineering discipline.

---

# 41. README / Portfolio Positioning

The repository README should immediately communicate the difficult parts.

Suggested headline:

> **FieldPulse — Offline-First Field Inspection & Evidence Platform**

Suggested description:

> A production-style, mobile-first inspection platform built with React, TypeScript, Node.js and PostgreSQL. FieldPulse enables field workers to perform inspections without network connectivity and synchronizes local changes with the backend when connectivity is restored.

Highlight:

```text
✓ Offline-first PWA
✓ IndexedDB local persistence
✓ Bidirectional synchronization
✓ Conflict detection
✓ Dynamic inspection forms
✓ Evidence management
✓ Role-based access control
✓ Versioned inspection templates
✓ Real-time operational dashboard
✓ Audit trail
✓ Background processing
✓ PostgreSQL + Prisma
```

---

# 42. Architecture Diagram

```text
                         ┌───────────────────────┐
                         │       Browser         │
                         │                       │
                         │  React + TypeScript   │
                         │                       │
                         │  ┌─────────────────┐  │
                         │  │ TanStack Query  │  │
                         │  └────────┬────────┘  │
                         │           │           │
                         │  ┌────────▼────────┐  │
                         │  │ Offline Service │  │
                         │  └────────┬────────┘  │
                         │           │           │
                         │      IndexedDB        │
                         └───────────┬───────────┘
                                     │
                                HTTPS / WS
                                     │
                         ┌───────────▼───────────┐
                         │       Node.js API     │
                         │        Fastify        │
                         ├───────────────────────┤
                         │ Auth / RBAC           │
                         │ Inspections            │
                         │ Templates              │
                         │ Evidence               │
                         │ Reviews                │
                         │ Sync                   │
                         │ Reports                │
                         └───────┬───────┬───────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    │                                  │
          ┌─────────▼─────────┐              ┌─────────▼─────────┐
          │    PostgreSQL     │              │       Redis       │
          │                   │              │                   │
          │ Core application  │              │ Cache / Queues    │
          │ data              │              │                   │
          └───────────────────┘              └─────────┬─────────┘
                                                       │
                                             ┌─────────▼─────────┐
                                             │    BullMQ Worker   │
                                             │                   │
                                             │ Evidence / Report │
                                             │ Notifications     │
                                             └─────────┬─────────┘
                                                       │
                                             ┌─────────▼─────────┐
                                             │ Object Storage    │
                                             │ MinIO / S3        │
                                             └───────────────────┘
```

---

# 43. Product Quality Bar

FieldPulse should **not** feel like:

```text
Student CRUD Project
```

It should feel like:

```text
Real Product
    +
Real Workflow
    +
Real Constraints
    +
Offline Capability
    +
Production Architecture
```

The strongest portfolio features are not the number of screens.

The strongest features are the engineering decisions behind them:

1. How offline data is persisted.
2. How synchronization works.
3. How conflicts are handled.
4. How inspection templates are versioned.
5. How permissions are enforced.
6. How files are stored.
7. How inspection state transitions are controlled.
8. How audit history is preserved.
9. How large datasets are rendered efficiently.
10. How failures and retries are handled.

---

# 44. Initial Build Recommendation

Start with this exact vertical slice:

```text
Login
  ↓
Dashboard
  ↓
Sites
  ↓
Create Inspection Template
  ↓
Build Sections + Questions
  ↓
Publish Template
  ↓
Create Inspection
  ↓
Assign Worker
  ↓
Worker opens mobile UI
  ↓
Downloads inspection
  ↓
Goes offline
  ↓
Completes inspection
  ↓
Adds photos
  ↓
Changes saved to IndexedDB
  ↓
Internet restored
  ↓
Sync
  ↓
Supervisor receives submission
  ↓
Reviews
  ↓
Requests rework / Approves
  ↓
Audit timeline records everything
```

This vertical slice should be the first major milestone.

Once this works end-to-end, expand the product.

---

# 45. Definition of Done

A feature is not considered complete merely because the happy-path UI works.

For important features, verify:

```text
✓ Loading state
✓ Empty state
✓ Validation
✓ Permission handling
✓ API failure
✓ Network failure
✓ Offline behavior where applicable
✓ Retry behavior
✓ Mobile responsiveness
✓ Desktop responsiveness
✓ Audit event where appropriate
✓ Tests
✓ Error logging
✓ Documentation
```

---

# 46. Final Product Vision

FieldPulse should ultimately demonstrate that a React/TypeScript/Node.js developer can build more than CRUD screens.

The finished project should communicate:

> **"I can design and build a production-style application from the database layer to a sophisticated mobile-first frontend, including offline data management, synchronization, workflows, permissions, background processing, evidence handling, and analytics."**

That is the standard to aim for.
