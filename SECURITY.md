# Security Policy

## Overview

The Lumina team takes the security of our platform and the privacy of our users extremely seriously. We appreciate the responsible disclosure of security vulnerabilities by the security research community.

This document outlines our security policy, the versions we actively support, and our responsible disclosure process.

---

## Supported Versions

We provide security updates for the following versions of Lumina:

| Version | Supported |
|---|---|
| `main` (latest) | ✅ Active support |
| Latest stable release | ✅ Active support |
| Previous major version | ⚠️ Critical fixes only |
| Older versions | ❌ No longer supported |

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, we ask that you follow responsible disclosure practices:

### Preferred Method: GitHub Security Advisories

1. Go to our [GitHub Security Advisories page](https://github.com/luminohq/lumina/security/advisories)
2. Click **"Report a vulnerability"**
3. Fill out the form with as much detail as possible

### Alternative: Email

Send a detailed report to **security@luminohq.com**.

Encrypt your message using our PGP key if the vulnerability is particularly sensitive. Our PGP key is available at [https://luminohq.com/.well-known/security.txt](https://luminohq.com/.well-known/security.txt).

---

## What to Include in Your Report

Please include as much of the following as possible:

- **Vulnerability type** (e.g., SQL injection, XSS, authentication bypass, IDOR, etc.)
- **Affected component** (e.g., the auth package, the dashboard API, the web app)
- **Affected URL or endpoint** (if applicable)
- **Step-by-step reproduction instructions**
- **Proof of concept** code or screenshots
- **Impact assessment** — who could exploit this and what could they do?
- **Suggested remediation** (if you have one)

The more detail you provide, the faster we can triage and fix the issue.

---

## Our Commitment to You

When you report a vulnerability to us, we commit to:

| Commitment | Timeline |
|---|---|
| **Acknowledge** your report | Within **48 hours** |
| **Confirm** the vulnerability and its severity | Within **5 business days** |
| **Provide a remediation timeline** | Within **7 business days** |
| **Notify you** when the fix is deployed | Upon deployment |
| **Credit you** in our security advisory | Unless you prefer anonymity |

We will keep you informed throughout the process and will never take legal action against researchers who follow this policy in good faith.

---

## Scope

### In Scope

The following assets are in scope for security research:

- **`*.luminohq.com`** — all Lumina-operated domains
- **`app.luminohq.com`** — the main web application
- **`api.luminohq.com`** — the public REST and GraphQL APIs
- **This repository** — the Lumina open-source codebase
- **`@lumina/*` npm packages** — our published packages

### Out of Scope

The following are explicitly **out of scope**:

- Denial of Service (DoS/DDoS) attacks
- Social engineering attacks against Lumina employees or users
- Physical attacks against Lumina infrastructure
- Vulnerabilities in third-party dependencies (report these upstream)
- Issues in software or services not operated by Lumina
- Rate limiting or brute-force issues without demonstrated impact
- Clickjacking on pages with no sensitive actions
- Missing security headers without demonstrated exploitability
- Theoretical vulnerabilities without a proof of concept

---

## Severity Classification

We use the [CVSS v3.1](https://www.first.org/cvss/v3.1/specification-document) scoring system for severity classification:

| Severity | CVSS Score | Response Time |
|---|---|---|
| **Critical** | 9.0 – 10.0 | Patch within 24 hours |
| **High** | 7.0 – 8.9 | Patch within 7 days |
| **Medium** | 4.0 – 6.9 | Patch within 30 days |
| **Low** | 0.1 – 3.9 | Patch in next release |
| **Informational** | N/A | Tracked for future improvement |

---

## Bug Bounty Program

Lumina currently operates a **private bug bounty program**. If you are interested in participating, email **security@luminohq.com** with your GitHub username and a brief background in security research.

Bounty ranges (indicative, final amount at Lumina's discretion):

| Severity | Reward |
|---|---|
| Critical | $500 – $5,000 |
| High | $200 – $500 |
| Medium | $50 – $200 |
| Low | Swag + public credit |

---

## Security Best Practices for Self-Hosters

If you are self-hosting Lumina, please follow these security hardening recommendations:

1. **Rotate secrets regularly** — especially `BETTER_AUTH_SECRET` and database credentials
2. **Use strong, unique passwords** for all services (PostgreSQL, Redis)
3. **Enable MFA** for all admin accounts
4. **Keep dependencies up to date** — run `bun update` regularly
5. **Use HTTPS everywhere** — never run Lumina over plain HTTP in production
6. **Restrict network access** — PostgreSQL and Redis should never be publicly accessible
7. **Enable audit logging** — monitor for unusual access patterns
8. **Use environment variables** — never commit secrets to version control
9. **Run with least privilege** — use a dedicated database user with minimal permissions
10. **Keep backups** — regularly test your backup and restore procedure

---

## Security Contact

- **Email**: security@luminohq.com
- **GitHub Security Advisories**: [https://github.com/luminohq/lumina/security/advisories](https://github.com/luminohq/lumina/security/advisories)
- **PGP Key**: Available at [https://luminohq.com/.well-known/security.txt](https://luminohq.com/.well-known/security.txt)

Thank you for helping keep Lumina and our users safe. 🙏
