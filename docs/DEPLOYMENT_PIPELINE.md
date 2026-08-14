# Continuous Deployment (CD) Pipeline Guide

Lumina enforces automated continuous deployment configured in `.github/workflows/cd.yml`.

---

## Deployment Architecture Workflow

```text
Developer Push to main / Tag v*
               ↓
   1. Code Verification (Linting, Formatting & Type Checks)
               ↓
   2. Build & Security Scan Containers (Multi-stage Docker & Trivy)
               ↓
   3. Deploy Staging Environment (Container Registry Push & Prisma Migration)
               ↓
   4. Staging Readiness Smoke Tests (GET /ready)
               ↓
   5. Production Environment Approval
               ↓
   6. Deploy Production Environment (AWS ECS Fargate Rollout & GET /ready Probe)
```

---

## Pipeline Jobs & Security Controls

1. **Code Verification**: Runs `format:check`, `lint`, and `check-types` before image creation.
2. **Container Vulnerability Scan**: Scans production Docker images with Trivy. Rejects deployment if `CRITICAL` unfixed
   vulnerabilities exist.
3. **Database Migrations**: Applies production migrations using `prisma migrate deploy` before container service traffic
   cutover.
4. **Smoke Tests**: Verifies readiness endpoint `GET /ready` before marking deployment successful.
