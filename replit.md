# iMusic — Indian Cinema Songs

A Spotify-style Indian music streaming app with songs from Hindi, Tamil, Telugu, English, Punjabi, and Kannada cinema. Features a full music player, browse by language, search, and charts — powered by iTunes for metadata and JioSaavn for full 320kbps song streams.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/imusic run dev` — run the frontend (port 25206)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, wouter
- API: Express 5
- Music data: iTunes Search API (free, no key needed)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/imusic/src/pages/` — frontend pages (home, search, album, artist, charts)
- `artifacts/imusic/src/context/PlayerContext.tsx` — global music player state
- `artifacts/imusic/src/components/layout/PlayerBar.tsx` — persistent bottom player

## Architecture decisions

- iTunes Search API used as music data source — free, no API key, accessible from Replit
- Each language (Hindi/Tamil/Telugu/etc.) has curated search queries for trending content
- Music player uses HTML5 Audio API via PlayerContext; full 320kbps streams sourced from JioSaavn (falls back to iTunes 30s preview if JioSaavn lookup fails)
- JioSaavn stream URL flow: search autocomplete API → get song ID → fetch encrypted_media_url → DES-ECB decrypt with key "38346591" → replace _96.mp4 with _320.mp4
- Node.js 24 uses OpenSSL 3 which disables legacy DES; API server start script includes NODE_OPTIONS=--openssl-legacy-provider to enable it
- No database needed — all data proxied from iTunes Search API at request time
- All CSS variables in `index.css` use a dark cinematic palette with saffron/amber accents

## Product

Users can browse trending songs by language, search across the entire Indian cinema catalog, view album details with full tracklists, explore artist pages, and play 30-second previews via the persistent bottom player. Supported languages: Hindi, Tamil, Telugu, English, Punjabi, Kannada.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- iTunes API preview URLs are 30-second AAC previews, not full tracks
- The iTunes API `country=in` parameter helps surface more Indian music
- After any OpenAPI spec change, run codegen before using the updated types: `pnpm --filter @workspace/api-spec run codegen`
- Do NOT run `pnpm dev` at workspace root — use workflow restart or per-package dev commands

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
