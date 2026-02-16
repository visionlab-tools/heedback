# Heedback — AI Context

## Project Overview

Heedback is an open source customer support & product feedback suite. Self-hosted, Docker-ready, multi-tenant.

## Stack

- **API**: AdonisJS 6 (TypeScript, Node.js 20+) — `packages/api/`
- **Admin Dashboard**: SvelteKit + Svelte 5 + Tailwind CSS 4 — `packages/web/`
- **Public Portal**: SvelteKit SSR + Svelte 5 + Tailwind CSS 4 — `packages/portal/`
- **Embeddable Widget**: Svelte 5, compiled JS — `packages/widget/`
- **Shared Types**: TypeScript — `packages/shared/`
- **Database**: PostgreSQL 16 (multi-tenant by column: `organization_id`)
- **Cache/Queue/Sessions**: Redis 7
- **Storage**: S3-compatible (MinIO in dev/self-hosted)
- **Email**: Kuriyr (self-hosted transactional email service)

## Architecture

- **Multi-tenant by column** (`organization_id` on every table)
- **Auth admin**: Session-based (AdonisJS Auth, cookie)
- **Auth end user**: Magic link + anonymous (configurable per org)
- **API**: REST JSON, versioned `/api/v1/`
- **Queue**: AdonisJS + Bull (Redis) for async jobs
- **Search**: PostgreSQL full-text search (tsvector)

## Key Conventions

- TypeScript strict mode everywhere
- ESLint + Prettier (no semicolons, single quotes, trailing commas)
- 2-space indentation, LF line endings
- AdonisJS conventions for the API (models, controllers, middleware, validators)
- SvelteKit conventions for web/portal

## Commands

```bash
# Development
npm run dev:api          # Start API dev server
npm run dev:web          # Start admin dashboard dev server
npm run dev:portal       # Start portal dev server

# Build
npm run build            # Build all packages
npm run build:api        # Build API only
npm run build:web        # Build dashboard only
npm run build:portal     # Build portal only

# Quality
npm run lint             # Lint all packages
npm run test             # Run API tests
npm run typecheck        # TypeScript type check

# Docker
docker compose up -d                     # Production
docker compose -f docker-compose.dev.yml up -d  # Dev infrastructure
```

## Project Structure

```
packages/api/          → AdonisJS 6 REST API
packages/web/          → SvelteKit admin dashboard
packages/portal/       → SvelteKit public portal (SSR)
packages/widget/       → Svelte embeddable widget
packages/shared/       → Shared TS types & utils
```

## Database Models (Multi-tenant)

Core models with `organization_id`:
- Organization, OrgMember, AdminUser, EndUser
- Collection, CollectionTranslation, Article, ArticleTranslation, ArticleFeedback
- Board, Post, Vote, Comment, Tag, PostTag
- ChangelogEntry, ChangelogEntryTranslation, ChangelogLabel, ChangelogPost, ChangelogSubscriber
