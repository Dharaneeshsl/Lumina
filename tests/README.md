# Integration Tests

These tests run the real Express routes against a dedicated PostgreSQL database using Vitest and Supertest.

## Requirements

- `TEST_DATABASE_URL` pointing at an isolated PostgreSQL database
- `BETTER_AUTH_SECRET`
- `CORS_ORIGIN`
- `RESEND_FROM`

## Scripts

- `bun run test`
- `bun run test:integration`
- `bun run test:coverage`

## Notes

- The test harness creates one schema per Vitest worker so the suites can run in parallel safely.
- Prisma migrations are applied automatically before the first test in each worker.
- Resend email delivery is intercepted at the network boundary so auth flows stay real without sending mail.
