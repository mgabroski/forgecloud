# ForgeCloud – Week 1 Summary (Days 1–10)

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
- dev.sh and stop.sh automation scripts

**Learned:** monorepo setup, enterprise structure, TypeORM initialization, Docker infra.

---

## **Day 2 – Tooling Hardening & Developer Experience**

- Husky + lint-staged configured
- Prettier formatting pipeline
- ts-node-dev hot reload
- Centralized env/config structure
- Backend architecture cleaned & stabilized

**Learned:** production-grade code quality pipelines, senior DX setup.

---

## **Day 3 – Authentication Foundations**

- DTO validation middleware added
- POST `/users` implemented
- POST `/auth/login` implemented
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
  - SessionProvider consumes `activeOrganizationId` and exposes `activeOrgId` + setter

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

- All tests passing: **26/26**

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
  - Added `organization.service.test.ts` covering:
    - `getOrganizationForUser` membership guard
    - `getOrganizationMembersForUser` membership guard
    - `deleteOrganizationAsOwner` (non-member, non-owner, success)
    - `inviteUserToOrganizationPlaceholder` (non-member, MEMBER, OWNER, ADMIN)

- **Integration tests**:
  - Extended `organization.int.test.ts` to cover:
    - `GET /organizations/:id` (auth required + member access)
    - `GET /organizations/:id/members`
    - `DELETE /organizations/:id` (owner-only delete + membership removal from `/organizations/my`)
    - `POST /organizations/:id/invite` placeholder behavior

- All backend test suites passing: **42/42**

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
    To feel visually consistent and “SaaS-like” without over-investing in design polish yet.

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
  - Fields: `id`, `organizationId`, `name`, `project_key` (`key`), `description`, `status`, `visibility`
  - Relations:
    - `Project` → `Organization` (many-to-one)
    - `Project` → `User` as `creator` and `lastUpdatedBy`

- Created **ProjectRepository** with:
  - `findByOrganization(organizationId)`
  - `findByOrganizationAndKey(organizationId, key)`
  - `createForOrganization(organizationId, createdByUserId, payload)`

- Implemented **ProjectService**:
  - `getActiveOrganizationIdForUser(userId)`:
    - Loads user by `userId`
    - If no user → `AuthError`
    - If `activeOrganizationId` set → uses it
    - Else:
      - Uses `OrganizationService.getOrganizationsForUser(userId)`
      - If no memberships → `ValidationError` (“User is not a member of any organization”)
      - Else:
        - Picks first org
        - Persists it into `user.activeOrganizationId`
        - Returns that id
  - `getProjectsForUser(userId)`:
    - Resolves active org via method above
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

- **Auth & Active Organization**:
  - `PATCH /auth/active-organization`:
    - Already implemented previously
    - Used by frontend to change active workspace
  - `AuthController.updateActiveOrganization`:
    - Validates auth
    - Accepts `organizationId` or `null`
    - Delegates to service and returns updated session payload

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
      - Key chip (mono)
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

- All backend tests passing: **full suite green**.

**Learned:** how to properly model multi-tenant projects, enforce scoping by active organization without trusting the client, and back everything with unit + integration tests. This is the core pattern that Sentinel/Atlas/Costs modules will reuse.

---

# 🧠 Final Vision – Confirmed Alignment

ForgeCloud will:

- Serve DevOps, SecOps, and CTO roles
- Provide dashboards, logs, cost tracking, anomaly detection
- Integrate SFTP/S3, Shadowserver, Shodan, and pipelines
- Use advanced indexing and query optimization
- Deliver a true enterprise SaaS architecture
- Become your flagship portfolio project and learning platform
