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

# 📘 Summary of Week 1 (so far)

We now have:

- Fully structured monorepo
- Backend running with migrations + seed
- Core multi-tenant domain
- First endpoints functioning
- Production-grade architecture foundations
