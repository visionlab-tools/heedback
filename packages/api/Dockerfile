# --- Build stage ---
FROM oven/bun:1 AS builder
WORKDIR /app

COPY packages/api/package.json packages/api/bun.lockb* ./
RUN bun install --frozen-lockfile

COPY packages/api/ ./
RUN bun run build

# --- Production stage ---
FROM oven/bun:1
WORKDIR /app

COPY --from=builder /app/package.json /app/bun.lockb* ./
RUN bun install --frozen-lockfile --production

COPY --from=builder /app/build ./build
COPY packages/api/database ./database

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3333/health || exit 1

CMD ["bun", "run", "build/bin/server.js"]
