# Lumina Architecture Decision Records (ADRs)

This document serves as an index of all Architecture Decision Records for the Lumina platform. ADRs document significant technical choices: what was decided, why, and what the trade-offs are.

ADRs are immutable once accepted. If a decision changes, a new ADR is created that supersedes the previous one.

---

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [ADR-001](#adr-001-monorepo-with-turborepo) | Monorepo with Turborepo | ✅ Accepted | 2026-01-15 |
| [ADR-002](#adr-002-bun-as-package-manager-and-runtime) | Bun as Package Manager and Runtime | ✅ Accepted | 2026-01-15 |
| [ADR-003](#adr-003-prisma-as-the-orm) | Prisma as the ORM | ✅ Accepted | 2026-01-20 |
| [ADR-004](#adr-004-better-auth-for-authentication) | better-auth for Authentication | ✅ Accepted | 2026-02-01 |
| [ADR-005](#adr-005-vite-for-the-dashboard-app) | Vite for the Dashboard App | ✅ Accepted | 2026-01-25 |
| [ADR-006](#adr-006-vanilla-css-over-tailwind) | Vanilla CSS over Tailwind | ✅ Accepted | 2026-01-25 |
| [ADR-007](#adr-007-zod-for-runtime-validation) | Zod for Runtime Validation | ✅ Accepted | 2026-02-10 |
| [ADR-008](#adr-008-resend-for-transactional-email) | Resend for Transactional Email | ✅ Accepted | 2026-03-01 |
| [ADR-009](#adr-009-postgresql-as-the-primary-database) | PostgreSQL as the Primary Database | ✅ Accepted | 2026-01-15 |
| [ADR-010](#adr-010-websockets-for-real-time-updates) | WebSockets for Real-Time Updates | ✅ Accepted | 2026-04-10 |

---

## ADR-001: Monorepo with Turborepo

**Status**: Accepted  
**Date**: 2026-01-15

### Context
Lumina is a multi-app product with significant code sharing across the dashboard, web app, and backend packages. We needed a strategy for managing this codebase.

### Decision
Use a **monorepo** managed by **Turborepo**.

### Rationale
- Enables atomic commits that span multiple packages
- Turborepo's incremental builds with remote caching significantly reduce CI time
- Shared packages (`@lumina/ui`, `@lumina/auth`, etc.) have a single source of truth
- All engineers work in one repository, reducing coordination overhead
- Bun workspace support is first-class and fast

### Trade-offs
- Repository size grows quickly; may need sparse checkout strategies at scale
- Onboarding for developers unfamiliar with monorepos takes time
- Build times without caching can be slow

---

## ADR-002: Bun as Package Manager and Runtime

**Status**: Accepted  
**Date**: 2026-01-15

### Context
We needed a fast, modern JavaScript runtime and package manager.

### Decision
Use **Bun** as both the package manager and (where possible) the runtime.

### Rationale
- Installation speed is ~25x faster than npm
- Built-in TypeScript support without a build step for scripts
- Native `.env` file loading
- Bun workspaces are compatible with the npm ecosystem
- Dramatically improves developer onboarding time

### Trade-offs
- Some npm packages have minor Bun compatibility issues (we track these)
- Production Node.js runtime still used for Next.js (Vercel infrastructure)
- Team must maintain awareness of Bun vs. Node.js differences

---

## ADR-003: Prisma as the ORM

**Status**: Accepted  
**Date**: 2026-01-20

### Context
We needed a database access layer that provides type safety, migrations, and is easy for the whole team to use.

### Decision
Use **Prisma** (v7+) with the PostgreSQL native adapter.

### Rationale
- Excellent TypeScript integration — generated types are accurate and complete
- Migration system is reliable and developer-friendly
- Prisma Studio provides a simple UI for database inspection
- Active community and excellent documentation
- The pg adapter provides native PostgreSQL performance

### Trade-offs
- Prisma abstracts some SQL, which can hide performance issues; we use raw queries for complex analytics
- Schema-first approach means the Prisma schema is the source of truth, not the DB directly
- Cold start time of the Prisma client can be a concern in serverless environments (mitigated with the pg adapter)

---

## ADR-004: better-auth for Authentication

**Status**: Accepted  
**Date**: 2026-02-01

### Context
Authentication is a core, security-critical feature. We evaluated Auth.js (NextAuth), Clerk, Supabase Auth, and better-auth.

### Decision
Use **better-auth**.

### Rationale
- Type-safe by design — the entire API is fully typed
- Self-hostable with no vendor lock-in (unlike Clerk)
- First-class support for organizations, teams, and multi-tenancy
- Built-in plugins for MFA, passkeys, and social OAuth
- Active development and responsive maintainers
- Works seamlessly with Prisma via the database adapter

### Trade-offs
- Less mature ecosystem than Auth.js
- Some advanced enterprise features (SAML) require additional work
- Documentation is still maturing

---

## ADR-005: Vite for the Dashboard App

**Status**: Accepted  
**Date**: 2026-01-25

### Context
The dashboard is a complex, data-heavy Single Page Application. We needed a build tool that provides fast development feedback and optimized production bundles.

### Decision
Use **Vite 6** for the dashboard app.

### Rationale
- Near-instant HMR (Hot Module Replacement) — critical for dashboard development velocity
- Excellent React support via `@vitejs/plugin-react`
- Tree-shaking and code splitting out of the box
- The dashboard does not need SSR, so Next.js overhead is unnecessary

### Trade-offs
- SPA means no SSR — acceptable for an authenticated dashboard
- SEO not a concern for the authenticated app
- Separate build pipeline from the Next.js web app

---

## ADR-006: Vanilla CSS over Tailwind

**Status**: Accepted  
**Date**: 2026-01-25

### Context
We needed a styling approach for our component library and apps.

### Decision
Use **Vanilla CSS with CSS Custom Properties** (CSS variables) for design tokens.

### Rationale
- Zero runtime cost — no JavaScript needed for styling
- CSS Custom Properties enable dynamic theming (dark mode, brand customization) at zero cost
- Full control over specificity and the cascade
- No dependency on a third-party CSS framework — the design system is ours to own
- CSS Grid and Flexbox are mature enough to handle any layout need

### Trade-offs
- More verbose than Tailwind for simple utility styles
- Requires discipline and team conventions to prevent CSS sprawl
- No built-in purging (mitigated by CSS Modules scoping)

---

## ADR-007: Zod for Runtime Validation

**Status**: Accepted  
**Date**: 2026-02-10

### Decision
Use **Zod** for all runtime validation at API boundaries, form inputs, and environment variable parsing.

### Rationale
- TypeScript-first: infer types from schemas, eliminating duplication
- Excellent error messages with `.parse()` and `.safeParse()`
- Works seamlessly with tRPC and React Hook Form
- Composable schema building

---

## ADR-008: Resend for Transactional Email

**Status**: Accepted  
**Date**: 2026-03-01

### Decision
Use **Resend** with **React Email** for all transactional emails.

### Rationale
- Modern developer experience — build email templates in React
- Excellent deliverability and developer-friendly API
- Webhooks for bounce and complaint tracking
- Pricing is predictable and generous on free tier

---

## ADR-009: PostgreSQL as the Primary Database

**Status**: Accepted  
**Date**: 2026-01-15

### Decision
Use **PostgreSQL 16** as the primary and sole database.

### Rationale
- Best-in-class support for complex analytics queries (CTEs, window functions, JSON)
- ACID compliance for transactional integrity
- Excellent ecosystem (Prisma, Supabase, Neon, RDS)
- JSON/JSONB support provides document-store flexibility when needed

---

## ADR-010: WebSockets for Real-Time Updates

**Status**: Accepted  
**Date**: 2026-04-10

### Decision
Use native **WebSockets** for real-time dashboard updates, with **Pusher** as a fallback/hosted option.

### Rationale
- WebSockets provide the lowest latency for chart updates
- Pusher handles connection management, scaling, and presence channels
- The `@lumina/notifications` package abstracts the provider so we can switch if needed
