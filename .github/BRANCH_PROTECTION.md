# Main branch protection

These settings are repository settings and must be applied by a GitHub organization owner or repository administrator.
Local files cannot enforce them.

Apply this ruleset to `main`:

| Setting                                    | Required value                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Pull request before merging                | Enabled                                                                                                      |
| Required approvals                         | 1 normally; 2 for security, infrastructure, database, and authentication changes                             |
| Dismiss stale approvals                    | Enabled                                                                                                      |
| Require Code Owner review                  | Enabled                                                                                                      |
| Require approval of most recent push       | Enabled                                                                                                      |
| Require status checks and branch freshness | Enabled; require `Quality checks`, `Production image vulnerability scan`, `Dependency review`, and `analyze` |
| Force pushes and deletions                 | Blocked                                                                                                      |
| Bypass                                     | Administrators only for documented emergency recovery                                                        |

Also enable automatic deletion of merged head branches. After configuration, use a non-admin account to confirm direct
and force pushes to `main` are rejected.
