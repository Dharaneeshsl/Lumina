# Section 28 — Analytics

## Delivered capabilities

### Collection

- Typed event taxonomy
- Event validation
- Property sanitization
- Consent enforcement
- Idempotency handling
- Request rate limiting

### Processing and analysis

- Active users
- Event counts
- Engagement
- Retention
- Funnels
- Cohort retention
- Feature usage ranking

### Delivery

- Analytics dashboard API
- Analytics export API
- Admin analytics client methods
- Privacy export/delete/anonymize operations

### Privacy and quality

- Sensitive property filtering
- Explicit consent states
- Idempotency tests
- Aggregate tests
- Service tests
- Date-range validation

## API

- `POST /api/v1/analytics/events`
- `GET /api/v1/analytics/dashboard`
- `GET /api/v1/analytics/export`
- `POST /api/v1/analytics/privacy/:userId`

Legacy aliases are also available under `/api/analytics`.

## Production persistence

The analytics service uses a repository interface. The API currently wires the repository boundary through the
application adapter, allowing replacement with Lumina's durable Prisma/queue infrastructure without changing analytics
contracts.
