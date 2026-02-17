# Heedback — AI Context

## Project Overview

Heedback is an open source customer support & product feedback suite. Self-hosted, Docker-ready, multi-tenant.

## Stack

- **API**: AdonisJS 6 (TypeScript, Bun) — `packages/api/`
- **Admin Dashboard**: Svelte 5 SPA + Vite + Tailwind CSS 4 + Lucide icons — `packages/web/` (custom router, no SvelteKit)
- **Public Portal**: SvelteKit SSR + Svelte 5 + Tailwind CSS 4 — `packages/portal/`
- **Embeddable Widget**: Svelte 5, compiled JS — `packages/widget/`
- **UI Kit**: Svelte 5 component library (raw `.svelte` exports, no build step) — `packages/ui-kit/`
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
bun run dev:api          # Start API dev server
bun run dev:web          # Start admin dashboard dev server
bun run dev:portal       # Start portal dev server

# Build
bun run build            # Build all packages
bun run build:api        # Build API only
bun run build:web        # Build dashboard only
bun run build:portal     # Build portal only

# Quality
bun run lint             # Lint all packages
bun run test             # Run API tests
bun run typecheck        # TypeScript type check

# Docker
docker compose up -d                     # Production
docker compose -f docker-compose.dev.yml up -d  # Dev infrastructure
```

## Project Structure

```
packages/api/          → AdonisJS 6 REST API
packages/web/          → Svelte 5 SPA admin dashboard (custom router)
packages/ui-kit/       → Shared Svelte 5 UI components (@heedback/ui-kit)
packages/portal/       → SvelteKit public portal (SSR)
packages/widget/       → Svelte embeddable widget
packages/shared/       → Shared TS types & utils
```

## UI Kit (`packages/ui-kit/`)

Shared component library consumed via `@heedback/ui-kit` workspace dependency. Exports raw `.svelte` files — the consumer's Vite compiles them. No build step.

Components:
- **Primitives**: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`
- **Display**: `Badge`, `Alert`, `Card`
- **Layout**: `PageHeader`, `EmptyState`, `DataTable`, `LoadingSpinner`
- **Navigation**: `Nav`, `NavItem`

## Database Models (Multi-tenant)

Core models with `organization_id`:
- Organization, OrgMember, AdminUser, EndUser
- Collection, CollectionTranslation, Article, ArticleTranslation, ArticleFeedback
- Board, Post, Vote, Comment, Tag, PostTag
- ChangelogEntry, ChangelogEntryTranslation, ChangelogLabel, ChangelogPost, ChangelogSubscriber
- Conversation, Message
