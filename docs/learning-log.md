# ForgeCloud Learning Log

## Week 1 – Core Bootstrapping

---

## ✅ Day 1 – Monorepo Bootstrapping & Backend Skeleton (2025-11-13)

### ✔️ Achievements

- Initialized the **ForgeCloud monorepo** using **Yarn 4 workspaces**:
  - `backend/`
  - `frontend/`
  - `infra/`
  - `docs/`

- Enabled Corepack and pinned Yarn (`packageManager: "yarn@4.5.0"`).

- Added shared TypeScript configuration (`tsconfig.base.json`).

- Bootstrapped the **backend**:
  - Node.js + TypeScript + Express
  - TypeORM configuration with clean `data-source.ts`
  - `/` and `/health` endpoints (with real DB ping)

- Added **Docker infrastructure**:
  - PostgreSQL 17
  - Redis 7

- Added **developer experience tooling**:
  - `scripts/dev.sh` → start DB + backend
  - `scripts/stop.sh` → stop infra
  - Auto-reload backend via `ts-node-dev`

- Set up **ESLint, Prettier, Husky, lint-staged**, auto-formatting on commit

### ✔️ Decisions Locked In

- Always use **TypeORM migrations** (no `synchronize`).
- Keep monorepo modular and clean.
- Backend-first development strategy.

---

## ✅ Day 2 – Domain Modeling, Migrations, and Base Endpoints (2025-11-14)

### ✔️ Achievements

### **1. Core Domain Modeling**

- Implemented:
  - `User`
  - `Organization`
  - `OrganizationMembership`
  - `Project`

- Designed full multi-tenant structure (users ⇒ orgs ⇒ projects).

- Added enums for roles, membership statuses, project visibility, etc.

### **2. Implemented TypeORM Entities**

- Added decorators, relations, timestamps.
- Fixed union type metadata issues using explicit column types.
- Ensured TypeScript + TypeORM compatibility.

### **3. TypeORM CLI + Yarn 4 Setup**

- Configured **`typeorm-ts-node-commonjs`**.
- Fully working migration commands:
  - `migration:generate`
  - `migration:run`
  - `migration:revert`

### **4. First Migration Generated & Applied**

Created tables:

- `users`
- `organizations`
- `organization_memberships`
- `projects`

### **5. Core Seed Script** (`seed:core`)

Creates:

- Founder user
- ForgeCloud Labs organization
- Membership (OWNER)
- Core project

### **6. Base Endpoints Added**

- `GET /users`
- `GET /organizations`
- `GET /projects`
  Using clean architecture:

```
repository → service → controller → route
```

### ✔️ Decisions Locked In

- All modules follow strict backend layering.
- Seed scripts live under `src/scripts/`.
- Monorepo backend structure is now stable.

---

## ✅ Day 3 – DTO Validation, Authentication & JWT (2025-11-15)

### ✔️ Achievements

### **1. DTO & Validation Middleware**

- Implemented global `validateDto` middleware using:
  - `class-validator`
  - `class-transformer`

- Sanitizes input, removes unknown fields, throws `validation-error`.
- Ensures every POST payload is strongly typed and validated.

### **2. Centralized Error & Response Handling**

- Added `AppError` hierarchy:
  - `validation-error`
  - `auth-error`
  - `conflict-error`
  - `not-found-error`

- Added global `error-handler` middleware.
- Added `sendSuccess` / `sendError` utilities for consistent API format.
- Standardized API output:

```
{
  success: boolean,
  data: T | null,
  error: { code, message, details } | null
}
```

### **3. User Registration (`POST /users`)**

- Added `CreateUserDto` (`email`, `password`, `fullName`, `avatarUrl`).
- Added hashing via `argon2`.
- Enforced unique email with `ConflictError('EMAIL_TAKEN')`.
- Successfully stores users in DB.

### **4. Authentication Module (`POST /auth/login`)**

- Added `LoginDto`.
- Implemented password verification via `argon2.verify`.
- Only `AuthProvider.LOCAL` users can login.
- Returns `accessToken` + sanitized `user` object.

### **5. JWT Middleware**

- Added `auth-middleware.ts`:
  - Reads `Authorization: Bearer <token>`.
  - Verifies token using `JWT_SECRET`.
  - Attaches `req.user = { id, email }`.
  - Throws `NO_TOKEN` / `INVALID_TOKEN` errors.

### **6. Protected Existing Route**

- `GET /users` is now protected using `authMiddleware`.
- Full Day 3 flow tested:
  - Register → Login → Access protected route.

### ✔️ Decisions Locked In

- Always validate request bodies with DTOs.
- Full centralized error & response system across backend.
- JWT-based authentication for all protected routes.
- Fail-fast environment validation (e.g., missing `JWT_SECRET`).

---

# 📘 Summary of Week 1 (so far)

We now have:

- A production-grade monorepo architecture
- Backend with migrations, seeds, and strict layering
- Users, organizations, projects domain
- DTO validation & centralized error handling
- Secure user registration & login
- JWT authorization working end-to-end

ForgeCloud's core backend foundation is now fully operational and enterprise-ready.

---

# 🧩 Overall Progress Summary (End of Day 3)

### 🚀 What We Built So Far

- Fully structured monorepo with Yarn 4
- Backend with strict layered architecture
- PostgreSQL + Redis infrastructure via Docker
- Full multi-tenant domain (Users → Organizations → Projects)
- TypeORM migrations & seed scripts
- Centralized API response & error-handling system
- DTO-based validation across the backend
- Secure authentication module (register + login)
- JWT middleware + first protected route

### 🧠 What We Learned

- How to build a production-grade backend from scratch
- Designing clean domain-driven entities
- How to structure monorepo projects professionally
- Why centralized validation, errors, and responses matter
- Secure password hashing (argon2) & JWT auth
- Clean layering improves maintainability and testability

### 🔒 Decisions Locked In Moving Forward

- Always validate DTOs for every request
- Always use centralized error/response format
- JWT for authentication & future RBAC for authorization
- TypeORM migrations only (never synchronize)
- Keep modules isolated and follow the repository → service → controller → route pattern
- Testing is a must (starting Day 4)
