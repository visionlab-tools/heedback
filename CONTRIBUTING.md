# Contributing to Heedback

Thank you for your interest in contributing to Heedback!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch (`feat/my-feature`) or fix branch (`fix/my-fix`)
4. Make your changes
5. Run checks: `bun run typecheck && bun run lint && bun run test`
6. Commit with a descriptive message
7. Push and open a Pull Request

## Development Setup

```bash
# Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# Install and run API
cd packages/api && bun install && bun run dev

# Install and run dashboard
cd packages/web && bun install && bun run dev

# Install and run portal
cd packages/portal && bun install && bun run dev
```

## Branch Naming

- `feat/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation
- `refactor/` — Code refactoring
- `test/` — Tests

## Commit Messages

Use conventional commits:

```
feat: add article search
fix: prevent duplicate votes
docs: update API documentation
refactor: extract email service
```

## Code Style

- TypeScript strict mode
- No semicolons, single quotes, trailing commas
- 2-space indentation
- Run `bun run lint` before committing

## Questions?

Open an issue or start a discussion.
