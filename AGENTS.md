# AGENTS.md

Guidance for coding agents working in this monorepo.

## Layout

```text
apps/
  api/          Express API (modules: chat, clubs, friends, leaderboard, leetcode, posts, profile)
  web/          Vite product UI
  admin/        Internal console (stub)
  docs/         Docs app (stub)
  storybook/    Design-system explorer (stub)
packages/
  db/           Prisma (@lumina/db)
  auth/         Better Auth (@lumina/auth)
  env/          Env loading (@lumina/env)
  storage/      S3 uploads (@lumina/storage)
  contracts/    Shared types (@lumina/contracts)
  constants/    Shared constants
  design-system/ UI primitives
  shared/       Cross-cutting helpers
  validators/   Validation schemas
  observability/ Logging
  kv/           Cache layer
  transactional/ Emails
  realtime/     Notifications
  sdk/          Public SDK (stub)
  analytics/    Analytics (stub)
  api-client/   HTTP client (stub)
tooling/        Shared eslint / tsconfig / prettier
infra/          Docker + CI stubs
workers/        Background workers (leetcode)
internal/       Internal scripts (seed)
tests/          Integration + unit tests
```

## Conventions

- Package names are `@lumina/*` (never `@repo/*`).
- API domain code lives under `apps/api/modules/<domain>/` with `*.handler.ts`, `*.service.ts`, `*.repo.ts`, `*.router.ts`, `*.lib.ts`.
- Prefer Bun for scripts and local runs.
- Do not invent product behavior in stub packages — keep stubs minimal until wired.
