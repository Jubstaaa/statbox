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

Please make sure these pass:

```bash
bun run lint
bun run build
```

## Scope

- Keep changes focused.
- Avoid unrelated refactors in the same PR.
- Follow the existing project structure: routes in `app`, view composition in `views`, shared UI in `components`, shared providers in `providers`, and domain utilities in `lib`.

## UI and product notes

- StatBox is an OBS-oriented League widget product, so avoid adding generic dashboard bloat.
- Prefer simple, stream-friendly UI changes over heavy configuration surfaces.
- Keep Riot API requests server-side.

## Issues

If you plan to make a larger change, open an issue first so the direction can be discussed before implementation.
