# @lumina/analytics

Typed, consent-aware analytics primitives for Lumina Section 28.

## Included

- Versioned event taxonomy
- Typed event payloads and actors
- Explicit consent states
- Mandatory idempotency keys
- Single and batch tracking client
- Active-user calculation
- Event-count aggregation
- Cohort retention calculation
- Engagement-rate calculation
- Bun tests for client and aggregate behavior

## Privacy contract

Events with `consent: 'DENIED'` are dropped before transport. Event properties must never contain passwords, tokens,
private message bodies, or other sensitive values.

## Architecture boundary

This package intentionally provides portable contracts and calculations. Durable event storage, queues, tenant
authorization, retention jobs, exports, and dashboard endpoints must use Lumina's existing API/database infrastructure
rather than introducing a second persistence system.

## Validation

```bash
cd packages/analytics
bun test
bun run check-types
```
