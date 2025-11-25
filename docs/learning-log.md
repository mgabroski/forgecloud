# ForgeCloud – Week 1 Summary (Days 1–14)

## 🚀 Project Overview

ForgeCloud is a full-stack multi-tenant DevOps/SecOps SaaS platform designed for DevOps engineers, security teams, CTOs, and cloud-oriented companies. It combines:

- Security analytics
- Observability & SLO monitoring
- Cloud cost tracking
- Log ingestion pipelines
- Shadowserver + Shodan integrations
- Anomaly detection & AI-powered diagnostics
- Multi-tenant organizations/projects

The platform is also a personal mastery journey focused on advanced backend architecture, indexing, performance tuning, distributed pipelines, and scalable frontend engineering.

---

# ✅ Week 1 – Core Bootstrapping Summary

## **Day 1 – Monorepo & Backend Skeleton**

- Yarn 4 monorepo initialized (backend, frontend, infra, docs)
- Corepack + Yarn configuration
- Shared tsconfig set up
- Backend bootstrapped using Node.js + Express + TypeORM
- `/health` endpoint implemented with DB ping
- Docker Compose (PostgreSQL + Redis)
- `dev.sh` and `stop.sh` automation scripts

**Learned:** monorepo setup, enterprise structure, TypeORM initialization, Docker infra.

---

## **Day 2 – Tooling Hardening & Developer Experience**

- Husky + lint-staged configured
- Prettier formatting pipeline
- `ts-node-dev` hot reload
- Centralized env/config structure
- Backend architecture cleaned & stabilized

**Learned:** production-grade code quality pipelines, senior DX setup.

---

## **Day 3 – Authentication Foundations**

- DTO validation middleware added
- `POST /users` implemented
- `POST /auth/login` implemented
- JWT auth middleware
- Clean controller → service → repository flow
- Centralized `ApiError` + error handling
- Auth tests created

**Learned:** robust authentication structure, clean OOP layering, senior error-handling flows.

---

## **Day 4 – Testing Foundations**

- Vitest + supertest fully set up
- Testing utilities created
- Tests for health and auth routes
- Prepared full testing structure for future modules

**Learned:** designing a reliable backend test suite.

---

## **Day 5 – Frontend Initialization**

- Vite + React + TS frontend bootstrapped
- Scalable folder structure: `app/`, `features/`, `shared/`
- Typed API client created with clean error handling
- Login UI implemented and wired to backend
- Design tokens + basic UI system added

**Learned:** modern FE architecture, strict typing, API contracts.

---

## **Day 6 – API Client Refinement & FE/BE Alignment**

- Eliminated any `any` types from API client
- Strengthened fetch handling and response typing
- Solidified login flow end-to-end
- Confirmed FE/BE contracts and improved consistency

**Learned:** strict TypeScript thinking, API contract maturity.

---

## **Day 7 – App Shell & Session Experience**

- Added **`SessionProvider`** on the frontend:
  - Global session state (`status`, `user`, `organizations`, `activeOrgId`, `error`)
  - Reads JWT from storage and calls `/auth/me`
  - Normalizes backend envelope `{ success, data, error }`
  - Handles 401 by clearing token and marking user as unauthenticated

- Updated **`/auth/me`** backend endpoint:
  - Returns `{ user, organizations }` in a clean envelope
  - Added `Cache-Control: no-store, max-age=0` to prevent caching sensitive data

- Implemented **global app shell**:
  - `AppShell` wraps all authenticated routes
  - `AppHeader` shows brand, “ALPHA” badge, workspace section, user chip, and logout
  - Left sidebar with navigation placeholders (Overview, Sentinel, Atlas, Costs, Settings)

- Integrated **ProtectedRoute + session**:
  - `/dashboard` is only accessible with a valid token and session
  - Logout clears token, resets session, and redirects to `/login`
  - Direct navigation to `/dashboard` without token bounces back to `/login`

- Polished **Dashboard overview**:
  - Uses session data instead of calling `/auth/me` directly
  - Clean “User” and “Workspace” cards in a light SaaS-style layout

**Learned:** how to design a proper session layer, separate auth from UI, and build a reusable app shell that can host many future modules (Sentinel, Atlas, Costs, etc.) while keeping security and UX aligned.

---

## **Day 8 – User Profile & Workspace Basics**

- Extended **User** model and auth payload:
  - Added `fullName` and `avatarUrl` fields on the backend entity
  - Exposed these fields in login and `/auth/me` responses (safe user without `passwordHash`)

- Implemented **`PATCH /auth/me`**:
  - `UpdateMeDto` with validation for `fullName` and `avatarUrl`
  - Authenticated route with `authMiddleware` + `validateDto`
  - Service method `updateMeByEmail` handling profile updates and returning a safe user

- Introduced **organizations in session**:
  - `/auth/me` now returns `{ user, organizations, activeOrganizationId }`
  - Basic organization + membership entities and repositories are in place
  - `SessionProvider` consumes `activeOrganizationId` and exposes `activeOrgId` + setter

- Built **Profile page** on the frontend:
  - `/profile` route guarded by `ProtectedRoute` and wrapped with `AppShell`
  - Shows signed-in email and authentication provider
  - Editable `fullName` and `avatarUrl` fields with save button
  - On save: calls `PATCH /auth/me` via `apiPatch` and then `refresh()` to sync session

- Polished **header & navigation**:
  - Header avatar now uses `avatarUrl` when present, falls back to gradient initials
  - Clicking the user chip opens `/profile`
  - Sidebar “Overview” is a real route link to `/dashboard` with active-state styling

**Learned:** how to evolve the auth/session model safely, add profile editing in a typed way, and keep backend & frontend perfectly aligned while reusing the existing shell and session infrastructure.

---

## **Day 9 – Organizations, Workspace Switching & Session Expansion**

### Backend Enhancements

- Added `activeOrganizationId` to the `User` entity + migration
- Implemented `PATCH /auth/active-organization` with membership validation
- Updated `/auth/me` to return `{ user, organizations, activeOrganizationId }`
- Added `OrganizationService.getOrganizationsForUser`
- Unified error envelopes & no-store caching

### Frontend Enhancements

- Updated `SessionProvider` to handle new session payload
- Normalized `activeOrgId` based on backend value
- Integrated workspace dropdown (AppHeader) with live session updates
- Verified profile flow still functions correctly with updated session model

### Testing

- Clean separation of unit tests vs integration tests
- Added full coverage for workspace switching logic:
  - Successful switch
  - Clearing active workspace
  - Rejecting workspace not belonging to user

**Learned:** true multi-tenant workspace architecture, session synchronisation, FE/BE contract evolution, advanced test discipline.

---

## **Day 10 – Workspace Surface & My Organization Page**

### Frontend

- Added **`WorkspacePage`** showing:
  - Active workspace details (name, slug, plan, role)
  - All organizations user belongs to

- Added **protected `/workspace` route**
- Updated `AppHeader` with **“Manage workspace”** link

### Backend

- Verified `GET /organizations/my` endpoint and membership role structure
- No changes needed; endpoint aligned perfectly

### Testing

- Added integration test for unauthenticated access (401)
- Validated membership roles (`OWNER`, `ADMIN`, etc.)
- Ensured clean payload structure in `/organizations/my`

**Learned:** how to expose clean workspace UX, connect FE/BE session logic, and test multi-tenant membership endpoints.

---

## **Day 11 – Organization Management & Members API**

### Backend

- Implemented `GET /organizations/:id`:
  - Returns a single organization only if the current user has an active membership
- Implemented `GET /organizations/:id/members`:
  - Returns members of the organization with `id`, `fullName`, `email`, `role`, and `joinedAt`
  - Access restricted to active members of the organization
- Implemented `DELETE /organizations/:id`:
  - Owner-only deletion with proper role guard
- Added placeholder `POST /organizations/:id/invite`:
  - Allows OWNER/ADMIN to call, MEMBER is rejected
  - Currently returns a placeholder response (future invite flow hook)
- Extended `OrganizationService` with:
  - `getOrganizationForUser`
  - `getOrganizationMembersForUser`
  - `deleteOrganizationAsOwner`
  - `inviteUserToOrganizationPlaceholder`

### Frontend

- Added **Organization Settings** view (read-only v1) for the active workspace:
  - General organization card (name, slug, createdAt, plan placeholder)
  - Members list with role badges (OWNER / ADMIN / MEMBER) and joined date
- Linked **Workspace → Organization Settings**:
  - “Organization settings →” link from `WorkspacePage`
- Polished Workspace UX:
  - Role badges now shown both in the Active workspace card and All workspaces list

### Testing

- **Unit tests**:
  - `organization.service.test.ts` covering:
    - `getOrganizationForUser` membership guard
    - `getOrganizationMembersForUser` membership guard
    - `deleteOrganizationAsOwner` (non-member, non-owner, success)
    - `inviteUserToOrganizationPlaceholder` (non-member, MEMBER, OWNER, ADMIN)

- **Integration tests**:
  - `organization.int.test.ts` covering:
    - `GET /organizations/:id` (auth required + member access)
    - `GET /organizations/:id/members`
    - `DELETE /organizations/:id` (owner-only delete + membership removal from `/organizations/my`)
    - `POST /organizations/:id/invite` placeholder behavior

**Learned:** how to design and enforce multi-tenant, role-based access for organizations; how to align backend org management APIs with a clean frontend admin view; and how to back role guards with both unit and integration tests for confidence.

---

## **Day 12 – UI Shell Lock-In & Visual Alignment**

### UX / UI

- Locked in the current **ForgeCloud UI shell** for this phase:
  - `AppShell` layout (header + sidebar + main content)
  - Dark shell with light content cards as v1 baseline
- Restyled:
  - `LoginPage`
  - `WorkspacePage`
  - `ProfilePage`
  - `OrganizationSettingsPage`
    to feel visually consistent and “SaaS-like” without over-investing in design polish yet.

- Sidebar structure stabilized:
  - Navigation: Overview, Projects
  - Modules placeholders: Sentinel, Atlas, Costs (marked “Coming soon”)
  - Account: Workspaces, Profile

### Product Decisions

- Decided to **postpone big UX redesign** to a dedicated “UI V2” milestone:
  - Current goal is **functionality and domain modeling**, not pixel perfection.
- Kept **“Continue with Google”** button visible on Login, but:
  - Not wired to backend yet
  - Explicitly treated as a future milestone

**Learned:** when to stop polishing and move forward with features; how to lock a v1 UX shell so you can ship functionality faster while keeping a consistent experience.

---

## **Day 13 – Multi-Tenant Projects & Active Workspace Hardening**

### Backend – Projects & Active Organization

- Introduced **`Project`** entity with multi-tenant scoping:
  - Fields: `id`, `organizationId`, `name`, `key`, `description`, `status`, `visibility`
  - Relations:
    - `Project` → `Organization` (many-to-one)
    - `Project` → `User` as `createdByUserId` and `lastUpdatedByUserId`

- Created **ProjectRepository** with:
  - `findByOrganization(organizationId)`
  - `findByOrganizationAndKey(organizationId, key)`
  - `createForOrganization(organizationId, createdByUserId, payload)`

- Implemented **ProjectService**:
  - Resolves active organization id for a user (reusing the same pattern as in auth/orgs)
  - `getProjectsForUser(userId)`:
    - Resolves active org
    - Returns projects for that org
  - `createProjectForUser(userId, input)`:
    - Resolves active org
    - Ensures project key is **unique per organization**
    - Creates project with default `visibility = PRIVATE` if not provided

- **Controller & Routes**:
  - `GET /projects` (auth required)
    - Uses `ProjectService.getProjectsForUser(req.user.id)`
    - Returns `{ projects }`
  - `POST /projects` (auth + validation)
    - Uses `CreateProjectDto` for validation
    - Delegates to `ProjectService.createProjectForUser`
    - Returns created project with `201`

### Frontend – Projects UI & Workspace Integration

- Added **`ProjectsPage`**:
  - Fetches projects via `GET /projects` for the **current active organization**
  - Shows:
    - Header with title and `Projects: X` count
    - Create project form:
      - `name`
      - `key` (auto uppercased)
      - `description` (optional)
      - `visibility` (`PRIVATE`, `INTERNAL`, `PUBLIC`)
    - Existing projects list:
      - Key chip
      - Name
      - Optional description
      - Visibility and created date

- Wired routing & navigation:
  - New protected route: `/projects` inside `AppShell`
  - Sidebar: “Projects” link under Navigation, with active state styling

- **Workspace + Header Behavior**:
  - Workspace dropdown in header uses `setActiveOrgId` which:
    - Calls `PATCH /auth/active-organization`
    - Reloads session (`refresh`) to keep backend + frontend in sync
  - `ProjectsPage` transparently uses active org from session; no orgId is ever trusted from client input.

### Testing

- **Unit Tests**:
  - `project.service.test.ts`:
    - Active org resolution:
      - User not found → `AuthError`
      - User with no active org and no memberships → `ValidationError`
      - User with active org set → uses it
      - User with no active org but memberships → picks first membership and persists `activeOrganizationId`
    - `getProjectsForUser` uses scoped org
    - `createProjectForUser`:
      - Enforces unique key per organization
      - Allows same key in different organizations

- **Integration Tests**:
  - `project.int.test.ts`:
    - `GET /projects` requires auth
    - Projects are scoped per active organization:
      - Switching active org changes `/projects` results
    - `POST /projects`:
      - Requires auth
      - Enforces unique key per org, but allows same key in another org when active org changes

**Learned:** how to properly model multi-tenant projects, enforce scoping by active organization without trusting the client, and back everything with unit + integration tests. This is the core pattern that Sentinel/Atlas/Costs modules will reuse.

---

## **Day 14 – Sentinel Foundations (Logs & Sources Skeleton)**

### Backend – Sentinel domain & APIs

- Defined Sentinel domain models:
  - **SentinelSource**
    - `id`, `organizationId`, `projectId | null`
    - `name`, `type` (`service | audit | job | other`)
    - `status` (`active | inactive`)
    - `description`, `environment`
    - `createdAt`, `updatedAt`

  - **SentinelLogEntry**
    - `id`, `organizationId`, `projectId | null`, `sourceId`
    - `timestamp`
    - `level` (`debug | info | warn | error`)
    - `message`
    - `context` + `metadata` (JSON)
    - `createdAt`, `updatedAt`

- Implemented **SentinelService**:
  - Reuses the same **active organization resolution pattern** as Projects:
    - Uses the authenticated user
    - If `activeOrganizationId` is set → uses it
    - Else looks at memberships to auto-pick and persist a default (or errors if none)

  - `createSourceForUser(userId, dto)`:
    - Validates name (non-empty), type, status
    - Creates a `SentinelSource` scoped to the user’s active organization

  - `listSourcesForUser(userId)`:
    - Returns all sources for the active organization

  - `createLogForUser(userId, dto)`:
    - Validates that `sourceId` belongs to the user’s active organization
    - Creates `SentinelLogEntry` scoped to that organization (and optional projectId)

  - `listLogsForUser(userId, { offset, limit })`:
    - Returns paginated logs for the active organization:
      - `{ logs, total, offset, limit }`

- Exposed Sentinel routes:
  - `GET /sentinel/sources`
    - Auth required
    - Returns `{ sources }` for the user’s active organization

  - `POST /sentinel/sources`
    - Auth + DTO validation
    - Delegates to `SentinelService.createSourceForUser`
    - Returns created source with `201`

  - `POST /sentinel/logs`
    - Auth + validation
    - Ingests a log entry for an existing source in the active org

  - `GET /sentinel/logs?offset=0&limit=50`
    - Auth required
    - Delegates to `SentinelService.listLogsForUser`
    - Returns `{ logs, total, offset, limit }`

- **Internal backend request logging**:
  - `sentinelInternalLogger.logBackendRequestForUser(userId, { method, path, statusCode, durationMs, userAgent, ip })`
  - `requestLoggingMiddleware` updated to:
    - Measure request duration
    - Skip `/health` to avoid noise
    - **Skip logging entirely in `NODE_ENV=test`** so Jest teardown doesn’t complain
    - For authenticated requests in dev/prod, log in Sentinel as “backend request” events

### Frontend – SentinelPage wiring

- Added Sentinel frontend types:
  - `LogSourceType`, `LogSourceStatus`, `LogLevel`
  - `SentinelSource`, `SentinelLogEntry`

- Implemented **`SentinelPage`** (`/sentinel` route):
  - Uses `apiGet` with our standard envelope:
    - `GET /sentinel/sources` → `{ success, data: { sources }, error }`
    - `GET /sentinel/logs?offset=0&limit=50` → `{ success, data: { logs, total, offset, limit }, error }`

  - Two main sections:
    1. **Sources card**
       - Shows:
         - Name
         - Type (service/audit/job/other)
         - Status pill (active/inactive)
         - Environment
         - Created date
       - Handles loading state, empty state (“No sources yet”), and error state

    2. **Recent logs card**
       - Shows:
         - Timestamp
         - Level with colored pill (error, warn, info/debug)
         - Message (line-clamped to keep rows compact)
       - Uses the `logs` list returned from backend
       - Same loading/empty/error handling

  - Integrated into `App.tsx` routing and sidebar:
    - Sidebar “Sentinel (logs & security)” now points to `/sentinel` (not just “coming soon”)
    - Page is wrapped with `ProtectedRoute` and `AppShell`

### Testing – Sentinel unit + integration

- **Unit tests** (`sentinel.service.test.ts`):
  - Valid source creation:
    - Name trimming, type validation, org scoping
  - Invalid source (empty/whitespace name) → `ValidationError`
  - Log creation requires:
    - Existing source
    - The source belonging to user’s active organization
  - List calls are scoped by resolved active organization

- **Integration tests** (`sentinel.int.test.ts`):
  - Setup:
    - Register a user via `POST /users`
    - Login via `POST /auth/login` to get JWT
    - Create an organization via `POST /organizations` (user becomes OWNER, active org set)

  - Scenario:
    - `GET /sentinel/sources` returns an array (initially empty or not, but shape is correct)
    - `POST /sentinel/sources` creates a `test-service`
    - `POST /sentinel/logs` creates a log for `test-service`
    - `GET /sentinel/sources` now includes the created source
    - `GET /sentinel/logs` includes the created log entry

  - Auth guard:
    - Unauthenticated calls to `/sentinel/sources`, `/sentinel/logs`, and `/sentinel/logs` (POST) return 401

- **Test suite**:
  - `yarn test:all` fully green after:
    - Removing extra `AppDataSource.initialize()` from Sentinel integration test
    - Disabling request logging in test environment

**Learned:** how to build an internal logging/audit module (Sentinel) as a proper domain; how to reuse the active-organization pattern for a new module; how to wire FE/BE end-to-end for a new feature; and how to keep Jest tests clean even when background logging is running.
