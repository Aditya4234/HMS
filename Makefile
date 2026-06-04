.PHONY: help dev-backend dev-frontend dev build-backend build-frontend build \
        test-backend test-frontend test lint-backend lint-frontend lint \
        db-push db-migrate db-seed db-studio \
        clean install setup

help:
	@echo "Hotel Management System - Makefile"
	@echo ""
	@echo "Development:"
	@echo "  make dev            Start both backend and frontend in development mode"
	@echo "  make dev-backend    Start backend only"
	@echo "  make dev-frontend   Start frontend only"
	@echo ""
	@echo "Build:"
	@echo "  make build          Build both backend and frontend"
	@echo "  make build-backend  Build backend only"
	@echo "  make build-frontend Build frontend only"
	@echo ""
	@echo "Testing:"
	@echo "  make test           Run all tests"
	@echo "  make test-backend   Run backend tests"
	@echo "  make test-frontend  Run frontend tests"
	@echo "  make lint           Lint all code"
	@echo ""
	@echo "Database:"
	@echo "  make db-push        Push Prisma schema to database"
	@echo "  make db-migrate     Create a new migration"
	@echo "  make db-seed        Seed the database"
	@echo "  make db-studio      Open Prisma Studio"
	@echo ""
	@echo "Utility:"
	@echo "  make clean          Remove node_modules and build artifacts"
	@echo "  make install        Install all dependencies"
	@echo "  make setup          Full project setup"

dev:
	@echo "Starting development servers..."
	@trap 'kill 0' EXIT; \
		$(MAKE) dev-backend & \
		$(MAKE) dev-frontend & \
		wait

dev-backend:
	@cd backend && npm run dev

dev-frontend:
	@cd frontend && npm run dev

build-backend:
	@cd backend && npm run build

build-frontend:
	@cd frontend && npm run build

build: build-backend build-frontend

test-backend:
	@cd backend && npm test

test-frontend:
	@cd frontend && npm test

test: test-backend test-frontend

lint-backend:
	@cd backend && npx tsc --noEmit

lint-frontend:
	@cd frontend && npm run lint

lint: lint-backend lint-frontend

db-push:
	@cd backend && npx prisma db push

db-migrate:
	@cd backend && npx prisma migrate dev

db-seed:
	@cd backend && npx ts-node prisma/seed.ts

db-studio:
	@cd backend && npx prisma studio

clean:
	@rm -rf backend/node_modules backend/dist backend/logs
	@rm -rf frontend/node_modules frontend/.next
	@echo "Cleaned build artifacts and node_modules"

install:
	@cd backend && npm install
	@cd frontend && npm install
	@cd backend && npx prisma generate

setup: install db-push db-seed
	@echo "Project setup complete!"
