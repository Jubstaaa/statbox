# StatBox

League of Legends widget builder for OBS browser sources.

StatBox helps streamers generate live overlay widgets that show ranked info,
recent games, and session-based performance for League of Legends streams.

## Features

- OBS-ready browser source URLs
- Multiple widget layouts: classic, minimal, compact, topbar
- SoloQ and Flex support
- Session tracking with all-day or custom start time
- Riot account resolution based on Riot ID
- Open source and lightweight setup

## Setup

Prerequisites: [Bun](https://bun.sh) 1.4.4 (the `packageManager` version) and
Node.js 26 (`engines.node`). Bun installs the dependencies; `bun run` then
starts `next`, `vitest` and `tsc` through their `node` shebangs, so they run
on the Node on your `PATH`. CI installs the version `engines.node` names.

1. Install dependencies:

```bash
bun install
```

2. Create your env file:

```bash
cp .env.example .env.local
```

3. Add your Riot API key to `.env.local`. Get one at
   [developer.riotgames.com](https://developer.riotgames.com); a development
   key expires every 24 hours, so a widget that worked yesterday usually just
   needs a fresh key.

4. Start the app:

```bash
bun run dev
```

## Scripts

```bash
bun run dev           # next dev
bun run build         # next build (standalone)
bun run start         # next start (after a build)
bun run format        # prettier --write .
bun run format:check  # prettier --check .
bun run lint          # eslint
bun run typecheck     # tsc --noEmit
bun run test          # vitest run
bun run test:watch    # vitest
bun run audit         # bun audit --audit-level=high
bun run knip          # unused files, exports and dependencies
bun run jscpd         # duplicated code in src
bun run depcruise     # dependency rules (cycles, orphans, layering)
bun run smoke         # smoke test a running server (SMOKE_BASE_URL)
```

## Environment

`.env.example` lists every variable the app reads:

| Variable             | Required | Default                   | Purpose                          |
| -------------------- | -------- | ------------------------- | -------------------------------- |
| `RIOT_API_KEY`       | yes      | none                      | Riot API key, server-side only   |
| `CACHE_DATABASE_URI` | no       | `file:./statbox-cache.db` | libsql URL of the response cache |

`bun run smoke` reads `SMOKE_BASE_URL` (default `http://127.0.0.1:3003`, the
port `docker-compose.yml` publishes); the app itself does not.

## Routes

- `/` landing page and account entry
- `/create` widget builder
- `/widget/[payload]` final widget route for OBS
- `/api/summoner/resolve` Riot ID to PUUID resolution
- `/api/summoner/[payload]` widget data fetch route
- `/api/health` readiness check: `200` when the SQLite cache answers, `503` otherwise

## Production notes

- Riot API requests run server-side only
- `/create` and `/widget` are excluded from indexing
- The app stores builder preferences in browser local storage
- The deployed key is a personal key; a production key is optional (see below)

## Deploy and rollback

Production is one container on a DigitalOcean droplet in `/opt/statbox`,
published on `127.0.0.1:3003` behind the droplet's shared Caddy, and released
by GitHub Actions only.

### Release path

1. **PR**: `ci.yml` runs `check` (format, lint, typecheck, test, build, audit,
   knip, jscpd, depcruise, actionlint, Trivy) and `image`. `image` builds the
   production image, starts it with `docker-compose.yml` on an empty data
   directory, runs `bun run smoke` against it, then rehearses a rollback: it
   starts the image now in production (`:latest`) under the PR's compose file
   and waits for it to be healthy.
2. **Merge to `main`**: `deploy.yml` runs the same image gate, pushes exactly
   that image as `ghcr.io/jubstaaa/statbox:<commit-sha>`, then deploys it with
   [`Jubstaaa/deploy-actions/compose`](https://github.com/Jubstaaa/deploy-actions)
   using the `docker-compose.yml` of the released commit. The action
   snapshots the cache, runs `docker compose up --wait`, probes the health URL
   and, if the release never becomes healthy, starts the previous tag again
   on the restored snapshot. `:latest` moves to the new SHA only after a
   healthy release.

### Rolling back by hand

```bash
gh workflow run deploy.yml --ref main -f image_tag=<full-40-char-sha>
# also put back the cache as it was while that SHA was running:
gh workflow run deploy.yml --ref main -f image_tag=<sha> -f restore_snapshot=true
```

- `image_tag` must be the full 40-character SHA of a `main` commit whose
  image is in GHCR (every commit `deploy.yml` released). Check one with
  `docker buildx imagetools inspect ghcr.io/jubstaaa/statbox:<sha>`.
- A rollback skips CI (that image passed it when built) and runs under that
  SHA's own `docker-compose.yml`, healthcheck included.
- `restore_snapshot` is only valid with `image_tag`; it discards every cache
  write since that snapshot and keeps the replaced file as
  `statbox-cache.db.failed-<UTC>`.

### Cache snapshots

Before each release the action copies `/opt/statbox/data/statbox-cache.db`
with SQLite's backup API to
`/opt/statbox/snapshots/statbox-cache-<running tag>-<UTC>.sqlite` and
integrity-checks it; a failed snapshot stops the deploy before anything
changes. The newest **3** are kept. The automatic rollback restores the
snapshot it just took; a manual rollback restores one only with
`restore_snapshot=true`.

### Health probes

- **Container healthcheck** (`docker-compose.yml`, travels with each SHA):
  what `compose up --wait` waits for. It stays on `/` for this release (see
  the upgrade note below).
- **Deploy health URL** (`deploy.yml`): `http://127.0.0.1:3003/`, probed after
  the new tag starts and after an automatic rollback. It lives in the
  workflow, so it must be a path every image answers.
- **`/api/health`**: `503` means the cache database cannot be opened or read
  (bad bind mount, corrupt file). The app creates the cache schema at
  startup, so a new, empty data directory is healthy.

A failed release shows the rollback in the deploy job log; if the log says
`ROLLBACK TO … FAILED`, the container is down: SSH in, read
`docker compose logs app` in `/opt/statbox` and roll back by hand as above.

### Environment on the droplet

`/opt/statbox/.env` is rendered by Infisical, not edited by hand: a new or
changed variable goes into Infisical first. Compose-only variables
(`IMAGE_TAG`, `DATA_DIR`, `IMAGE_CACHE_DIR`, `PORTAINER_TEAMS`) are explained
in `docker-compose.yml`.

A rebuilt droplet needs the bind-mount directories owned by the container
user before the first deploy:
`install -d -o 1001 -g 1001 /opt/statbox/data /opt/statbox/cache/images`.

### Upgrade notes

- A compose change that probes a path older images do not serve ships one
  release after the image that serves it, since a rollback runs the previous
  image under the new file. `/api/health` arrives with this release; the
  probe switch to it (`ci/health-gate-switch`) deploys only after this
  release is live, and its PR's rollback rehearsal fails until `:latest`
  answers `/api/health`.

## Riot API key and rate budget

The deployed instance runs on a Riot **personal** API key. Its limits are
counted per routing value (`euw1`, `europe`, `americas`, …):

- 20 calls per 1 second
- 100 calls per 2 minutes

`src/lib/riot/riot.gate.ts` keeps every routing value inside both windows
(sliding, so they cannot line up with Riot's to double a burst). What that
means for widgets:

- A **cold** widget (nothing cached yet) costs about 25 calls, 22 of them on
  the shared regional value, so about four new widgets per region fit in two
  minutes.
- A **warm** widget polls every 2 minutes against data cached for 5, which
  costs about two calls per 5 minutes: roughly a hundred open widgets per
  region once they are warm.
- When the budget is spent, a call that cannot start within 10 s is answered
  with `503` and `Retry-After: 30`; an open widget keeps its last data and
  polls again.

A Riot **production** key is optional. If the instance moves to one, raise
`SHORT_WINDOW` and `LONG_WINDOW` in `riot.gate.ts` to the limits Riot grants
it; nothing else changes.

## Legal

StatBox is not endorsed by Riot Games and does not reflect the views or
opinions of Riot Games or anyone officially involved in producing or managing
Riot Games properties. League of Legends and Riot Games are trademarks or
registered trademarks of Riot Games, Inc.

See also:

- [Privacy Policy](https://statbox.live/privacy)
- [Terms of Use](https://statbox.live/terms)
- [Contributing](./CONTRIBUTING.md)

## Repository

[github.com/Jubstaaa/statbox](https://github.com/Jubstaaa/statbox)
