# syntax=docker/dockerfile:1
FROM oven/bun:1.3.0-alpine AS dependencies
WORKDIR /app

# `.dockerignore` excludes credentials and build outputs from this context.
# Install from the committed lockfile for reproducible workspace resolution.
COPY . .
RUN bun install --frozen-lockfile

FROM oven/bun:1.3.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV SERVER_PORT=3000

COPY --from=dependencies --chown=bun:bun /app/node_modules ./node_modules
COPY --chown=bun:bun package.json ./package.json
COPY --chown=bun:bun bun.lock ./bun.lock
COPY --chown=bun:bun apps/api ./apps/api
COPY --chown=bun:bun workers/leetcode ./workers/leetcode
COPY --chown=bun:bun packages ./packages

USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:3000/ok').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "apps/api/server.ts"]
