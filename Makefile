.PHONY: help install dev build test lint format typecheck clean docker-up docker-down migrate seed reset

help:
	@echo "Available targets:"
	@echo "  install      - Install all dependencies"
	@echo "  dev          - Start all services in development mode"
	@echo "  build        - Build all packages and services"
	@echo "  test         - Run all tests"
	@echo "  lint         - Lint all code"
	@echo "  format       - Format all code"
	@echo "  typecheck    - Type-check all TypeScript code"
	@echo "  docker-up    - Start Docker services (postgres, redis, localstack)"
	@echo "  docker-down  - Stop Docker services"
	@echo "  migrate      - Run database migrations"
	@echo "  seed         - Seed the database with sample data"
	@echo "  reset        - Reset database (drop, migrate, seed)"
	@echo "  clean        - Clean all build artifacts and dependencies"

install:
	pnpm install

dev: docker-up
	pnpm run dev

build:
	pnpm run build

test:
	pnpm run test

lint:
	pnpm run lint

format:
	pnpm run format

typecheck:
	pnpm run typecheck

docker-up:
	docker-compose up -d
	@echo "Waiting for services to be healthy..."
	@sleep 5

docker-down:
	docker-compose down

migrate:
	cd packages/db && pnpm exec prisma migrate deploy

seed:
	cd packages/db && pnpm exec tsx scripts/seed.ts

reset: docker-down docker-up
	@echo "Resetting database..."
	cd packages/db && pnpm exec prisma migrate reset --force

clean:
	rm -rf node_modules
	rm -rf packages/*/node_modules packages/*/dist
	rm -rf services/*/node_modules services/*/dist
	rm -rf .turbo
	docker-compose down -v
