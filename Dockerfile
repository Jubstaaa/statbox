# syntax=docker/dockerfile:1

# ─── deps ────────────────────────────────────────────────────────────────
# Alpine end to end: bun resolves the musl builds of sharp and libsql
# (@libsql/linux-x64-musl ships a prebuild, so no compiler is needed), and the
# node:alpine runner loads those same binaries at request time. Base images are
# pinned by digest (Renovate moves them), so a rebuild of the same commit
# gets the same layers.
FROM oven/bun:1.4.4-alpine@sha256:4cf82f5686b196504fe119db3fcd9185b191f82ece82c40680e597228ec6070a AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── build ───────────────────────────────────────────────────────────────
# Turbopack (`next build`) — it traces standalone's runtime deps correctly.
# Built on the runner's Node 26, which engines.node names: the bun image has no
# Node, so `bun run build` there would quietly build with Bun instead.
FROM node:26-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Prerendering only touches static pages; the Riot-backed routes are dynamic, so
# no real key is needed to build.
ENV RIOT_API_KEY=build-time-placeholder
RUN node_modules/.bin/next build

# ─── runner ──────────────────────────────────────────────────────────────
# Next's standalone server on Node (not `bun run start`) — keeps idle RSS near the
# measured 110MB instead of ~400MB, which matters on a shared 1GB droplet.
FROM node:26-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Bind every interface, as Next's standalone docs do; otherwise the server
# binds the container ID Docker puts in HOSTNAME and loopback is refused.
ENV HOSTNAME=0.0.0.0

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
