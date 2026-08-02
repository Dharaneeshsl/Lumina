# Release Process

Lumina uses Conventional Commits and semantic versioning for public releases.

## Version policy

- `fix:` commits result in patch releases for customer-visible bug fixes.
- `feat:` commits result in minor releases for backward-compatible features.
- Commits containing `BREAKING CHANGE:` result in major releases.
- `docs:`, `test:`, and most `chore:` commits do not release by themselves.

## Before release

1. Confirm CI is passing on `main`.
2. Review the generated changelog for customer-facing clarity and remove accidental sensitive details.
3. Confirm migrations are compatible with the currently deployed application.
4. Verify that production environment variables and third-party service limits are ready.
5. Name a release owner and rollback owner.

## Rollback

For an application regression, redeploy the last known-good artifact or revert the release commit, then validate the
primary sign-in and dashboard journeys. Do not automatically roll back a database migration: follow its specific
migration plan and restore only from a tested backup when necessary.

## After release

Monitor error rate, latency, authentication failures, and support reports for at least 30 minutes. Capture release notes
and follow-up actions in the tracking system.
