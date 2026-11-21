# Contributing

Thanks for contributing to StatBox.

## Local setup

```bash
bun install
cp .env.example .env.local
```

Add a valid Riot API key to `.env.local`, then run:

```bash
bun run dev
```

## Before opening a PR

CI runs these on every PR; please make sure they pass locally:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
bun run audit
bun run knip
bun run jscpd
bun run depcruise
```

CI also builds the Docker image, smoke tests it (`bun run smoke`) and rehearses
a rollback to the production image; see "Deploy and rollback" in the README.

## Scope

- Keep changes focused.
- Avoid unrelated refactors in the same PR.
- Follow the existing project structure: code lives next to the only place that uses it and moves to a shared folder once a second user appears.

```
src/
  app/                 routes; `_components/` beside a route holds parts only it uses
    (main)/            landing, builder (`create/`), privacy and terms pages
    api/               route handlers (summoner lookups, health)
    widget/[payload]/  the OBS widget page
  features/            self-contained features shared by routes (widget, widget-generator)
  components/          small UI parts used by more than one route or feature
  hooks/               generic hooks shared across features
  lib/                 cross-cutting infrastructure (Riot client, cache, Data Dragon, query client)
  instrumentation.ts   server startup (creates the cache schema)
scripts/               smoke test run against a built container
```

## UI and product notes

- StatBox is an OBS-oriented League widget product, so avoid adding generic dashboard bloat.
- Prefer simple, stream-friendly UI changes over heavy configuration surfaces.
- Keep Riot API requests server-side.

## Issues

If you plan to make a larger change, open an issue first so the direction can be discussed before implementation.
