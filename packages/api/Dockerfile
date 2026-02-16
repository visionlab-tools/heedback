# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY packages/api/package.json packages/api/package-lock.json* ./
RUN npm ci

COPY packages/api/ ./
RUN npm run build

# --- Production stage ---
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json* ./
RUN npm ci --production

COPY --from=builder /app/build ./build
COPY packages/api/database ./database

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3333/health || exit 1

CMD ["node", "build/bin/server.js"]
