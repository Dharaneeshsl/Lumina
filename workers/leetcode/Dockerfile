# syntax=docker/dockerfile:1
FROM oven/bun:1.3.0-alpine AS dependencies
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=dependencies --chown=bun:bun /app/node_modules ./node_modules
COPY --chown=bun:bun apps/api ./apps/api
COPY --chown=bun:bun workers/leetcode ./workers/leetcode
COPY --chown=bun:bun packages ./packages

USER bun
CMD ["bun", "workers/leetcode/src/index.ts"]
