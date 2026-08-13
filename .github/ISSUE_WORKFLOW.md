# Issue workflow

Lumina work moves through one project status at a time:

```text
Backlog → Ready → In Progress → In Review → Testing → Done
```

| Status | Meaning | Exit condition |
| --- | --- | --- |
| Backlog | Captured but not yet prioritized | Scope, priority, and owner are triaged |
| Ready | Prioritized and actionable | An owner starts work |
| In Progress | Actively being implemented | A pull request is opened |
| In Review | Pull request awaits feedback or required checks | Required reviews and checks pass |
| Testing | Merged to a test environment or undergoing verification | Acceptance criteria are verified |
| Done | Delivered and verified | Issue is closed with PR/release reference |

## Operating rules

- Every issue uses one of the templates in `.github/ISSUE_TEMPLATE`.
- Triage assigns an owner, priority, and project status before work begins.
- Each pull request links its issue using `Closes #<number>` when appropriate.
- Keep work in **In Review** while review, CI, or requested changes are outstanding.
- Security vulnerabilities are reported privately; do not create a public issue before security-team approval.
