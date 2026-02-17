# --- Build stage ---
FROM oven/bun:1 AS builder
WORKDIR /app

COPY packages/portal/package.json packages/portal/bun.lockb* ./
RUN bun install --frozen-lockfile

COPY packages/portal/ ./
RUN bun run build

# --- Production stage ---
FROM oven/bun:1
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3001/ || exit 1

CMD ["bun", "run", "build/index.js"]
