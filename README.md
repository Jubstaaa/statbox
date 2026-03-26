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

1. Install dependencies:

```bash
bun install
```

2. Create your env file:

```bash
cp .env.example .env.local
```

3. Add your Riot API key to `.env.local`.

4. Start the app:

```bash
bun run dev
```

## Scripts

```bash
bun run dev
bun run lint
bun run build
```

## Environment

```bash
RIOT_API_KEY=RGAPI-your-riot-api-key
```

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
