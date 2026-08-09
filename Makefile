# Lumina — Makefile
# Convenience wrapper around common bun/turbo commands.
# Usage: make <target>   e.g.  make dev   make test   make db-seed

.PHONY: help dev build test lint format typecheck clean \
        db-push db-migrate db-seed db-studio db-generate \
        docker-up docker-down docker-logs setup

# Default target — print help
help:
	@echo ""
	@echo "  🌿 Lumina — available make targets"
	@echo ""
	@echo "  Development"
	@echo "    make dev          Start all apps in dev mode"
	@echo "    make build        Build all apps and packages"
	@echo "    make clean        Remove all build artifacts"
	@echo ""
	@echo "  Code Quality"
	@echo "    make lint         Run ESLint / OxLint"
	@echo "    make format       Format with Prettier"
	@echo "    make typecheck    TypeScript type check"
	@echo ""
	@echo "  Testing"
	@echo "    make test         Run unit tests"
	@echo "    make test-watch   Run tests in watch mode"
	@echo "    make test-e2e     Run end-to-end tests"
	@echo "    make coverage     Generate coverage report"
	@echo ""
	@echo "  Database"
	@echo "    make db-push      Push Prisma schema (no migration)"
	@echo "    make db-migrate   Create a new migration"
	@echo "    make db-generate  Generate Prisma client"
	@echo "    make db-seed      Seed the database"
	@echo "    make db-studio    Open Prisma Studio"
	@echo ""
	@echo "  Docker"
	@echo "    make docker-up    Start all Docker services"
	@echo "    make docker-down  Stop all Docker services"
	@echo "    make docker-logs  Tail Docker logs"
	@echo ""
	@echo "  Setup"
	@echo "    make setup        First-time dev environment setup"
	@echo ""

# ── Development ───────────────────────────────────────────────────────────────

dev:
	bun run dev

build:
	bun run build

clean:
	find . -type d -name ".turbo" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	@echo "✓ Build artifacts cleaned"

# ── Code Quality ──────────────────────────────────────────────────────────────

lint:
	bun run lint

format:
	bun run format

typecheck:
	bun run check-types

# ── Testing ───────────────────────────────────────────────────────────────────

test:
	bun run test

test-watch:
	bun run test --watch

test-e2e:
	bun run test:e2e

coverage:
	bun run test --coverage

# ── Database ──────────────────────────────────────────────────────────────────

db-push:
	bun run db:push

db-migrate:
	bun run db:migrate

db-generate:
	bun run db:generate

db-seed:
	bun run db:seed

db-studio:
	bun run db:studio

# ── Docker ────────────────────────────────────────────────────────────────────

docker-up:
	docker compose up -d
	@echo "✓ Services started. Web UI: http://localhost:5173  API: http://localhost:3000"

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# ── Setup ─────────────────────────────────────────────────────────────────────

setup:
	@echo "🚀 Setting up Lumina development environment..."
	@command -v bun >/dev/null 2>&1 || { echo "❌ Bun not found. Install: curl -fsSL https://bun.sh/install | bash"; exit 1; }
	@echo "✓ Bun found: $$(bun --version)"
	bun install
	@[ -f .env ] || { cp .env.example .env; echo "✓ Created .env from .env.example (fill in your values)"; }
	@echo ""
	@echo "✅ Setup complete! Next steps:"
	@echo "   1. Edit .env with your database and API credentials"
	@echo "   2. Run: make docker-up   (starts PostgreSQL + Redis)"
	@echo "   3. Run: make db-push     (push schema to DB)"
	@echo "   4. Run: make db-seed     (seed demo data)"
	@echo "   5. Run: make dev         (start development server)"
	@echo ""
