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
```

## Environment

`.env.example` lists every variable the app reads:

| Variable             | Required | Default                   | Purpose                          |
| -------------------- | -------- | ------------------------- | -------------------------------- |
| `RIOT_API_KEY`       | yes      | none                      | Riot API key, server-side only   |
| `CACHE_DATABASE_URI` | no       | `file:./statbox-cache.db` | libsql URL of the response cache |

## Routes

- `/` landing page and account entry
- `/create` widget builder
- `/widget/[payload]` final widget route for OBS
- `/api/summoner/resolve` Riot ID to PUUID resolution
- `/api/summoner/[payload]` widget data fetch route

## Production notes

- Riot API requests run server-side only
- `/create` and `/widget` are excluded from indexing
- The app stores builder preferences in browser local storage
- A Riot production key is required for public production usage

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
