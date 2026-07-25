# syntax=docker/dockerfile:1

# ─── deps ────────────────────────────────────────────────────────────────
# Alpine end to end: bun resolves the musl builds of sharp and libsql
# (@libsql/linux-x64-musl ships a prebuild, so no compiler is needed), and the
# node:alpine runner loads those same binaries at request time.
FROM oven/bun:1-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── build ───────────────────────────────────────────────────────────────
# Turbopack (`next build`) — it traces standalone's runtime deps correctly.
FROM oven/bun:1-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Inlined into the client bundle at build time, so it has to be present here.
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Prerendering only touches static pages; the Riot-backed routes are dynamic, so
# no real key is needed to build.
ENV RIOT_API_KEY=build-time-placeholder
RUN bun run build

# ─── runner ──────────────────────────────────────────────────────────────
# Next's standalone server on Node (not `bun run start`) — keeps idle RSS near the
# measured 110MB instead of ~400MB, which matters on a shared 1GB droplet.
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# data/ holds the libsql cache file, .next/cache/images the optimizer's output for
# the remote ddragon champion icons. Both are bind-mounted from the host.
RUN mkdir -p /app/data /app/.next/cache/images \
    && chown -R nextjs:nodejs /app/data /app/.next/cache

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
