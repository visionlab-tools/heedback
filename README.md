# Heedback

The open source customer support & product feedback suite.
Self-hosted, Docker-ready, multi-tenant.

## Features

- **Help Center / Knowledge Base** — Collections, articles, rich text editor, multi-language, full-text search
- **Feedback Board** — User submissions, voting, duplicate detection, merge
- **Public Roadmap** — Kanban view of planned/in-progress/completed features
- **Changelog** — Release notes with labels, email notifications, scheduled publishing
- **Embeddable Widget** — Feedback form, vote, and changelog popup for your app
- **Chat & Inbox** *(v2)* — Real-time support with shared inbox

## Stack

- **API**: [AdonisJS 6](https://adonisjs.com/) (Node.js)
- **Admin Dashboard**: [SvelteKit](https://kit.svelte.dev/) + Svelte 5
- **Public Portal**: [SvelteKit](https://kit.svelte.dev/) (SSR)
- **Widget**: Svelte 5 (compiled JS bundle)
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Storage**: S3-compatible (MinIO)
- **Email**: [Kuriyr](https://github.com/visionlab-tools/kuriyr)

## Quick Start

```bash
git clone https://github.com/visionlab-tools/heedback.git
cd heedback
cp .env.example .env  # Edit with your settings
docker compose up -d
```

The first launch will automatically run database migrations and create the super admin account.

### Services

| Service   | URL                          | Description              |
|-----------|------------------------------|--------------------------|
| API       | http://localhost:3333        | AdonisJS REST API        |
| Dashboard | http://localhost:3000        | Admin dashboard          |
| Portal    | http://localhost:3001        | Public portal (SSR)      |
| MinIO     | http://localhost:9001        | S3 storage console       |

### Default Credentials

- **Super Admin**: `admin@example.com` / `changeme` (configure in `.env`)
- **MinIO Console**: `heedback_minio` / `heedback_minio_secret`

## Project Structure

```
heedback/
├── docker-compose.yml          # Production Docker Compose
├── docker-compose.dev.yml      # Development Docker Compose
├── packages/
│   ├── api/                    # AdonisJS 6 — REST API + WebSocket
│   ├── web/                    # SvelteKit — Admin dashboard
│   ├── portal/                 # SvelteKit — Public portal
│   ├── widget/                 # Svelte — Embeddable widget
│   └── shared/                 # Shared TypeScript types & utils
├── .github/workflows/          # CI/CD pipelines
└── docs/                       # Documentation
```

## Development

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- Docker & Docker Compose

### Local Development

```bash
# Start infrastructure (PostgreSQL, Redis, MinIO, Kuriyr)
docker compose -f docker-compose.dev.yml up -d

# Install dependencies
cd packages/api && bun install
cd packages/web && bun install
cd packages/portal && bun install

# Run services
bun run dev:api     # API on :3333
bun run dev:web     # Dashboard on :3000
bun run dev:portal  # Portal on :3001
```

## Configuration

All configuration is done via environment variables. See [`.env.example`](.env.example) for the full list.

## License

[MIT](LICENSE)
