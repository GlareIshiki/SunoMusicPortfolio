# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs Vite on :3000 + Express API on :3001 concurrently)
npx concurrently "npx vite --host" "npx tsx watch server/index.ts"

# Client only (no API - data hooks will fail)
npx vite --host

# Server only
npx tsx watch server/index.ts

# Build (client + server)
npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Production
NODE_ENV=production node dist/index.js

# Type check
npx tsc --noEmit

# Regenerate seed data (720 songs + 3 playlists → data/*.json)
npx tsx scripts/seed-data.ts

# Format
npx prettier --write .
```

**Note**: pnpm is the package manager but is not in PATH on this Windows environment. Use `npm install` to add packages (creates package-lock.json which is gitignored).

## Architecture

Full-stack SPA: React 19 frontend (Vite, port 3000) + Express backend (port 3001) with JSON file persistence. Vite proxies `/api` and `/uploads` to the Express server in dev.

### Data Flow

```
data/songs.json ←→ server/data.ts ←→ server/index.ts (Express API)
                                         ↕ /api/*
                                    vite proxy (:3000 → :3001)
                                         ↕
                              client/src/lib/api.ts
                                         ↕
                            client/src/hooks/useSongs.ts
                                         ↕
                              Pages (Home, SongDetail)
```

Songs are stored in `data/songs.json` (720 entries). The Express server reads/writes this file. The client fetches via `/api/songs`. Non-admin users only see songs with `visible: true`.

### Provider Hierarchy (App.tsx)

```
ErrorBoundary → AdminProvider → ThemeProvider → PlayerProvider → TooltipProvider
```

AdminProvider must be outermost app provider because Header, SongCard, SongDetail all call `useAdmin()`.

### Key Contexts

- **AdminContext** — `isAdmin`, `login()`, `logout()`. Keyboard shortcut Ctrl+Shift+A toggles login dialog. Auth uses httpOnly cookie with in-memory token set on server.
- **PlayerContext** — Global audio player state. `playSong()`, `togglePlay()`, queue management, repeat/shuffle modes. Uses a single `<audio>` element via ref.
- **ThemeContext** — Dark/light toggle, persisted to localStorage.

### API Routes (server/index.ts)

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/songs` | - | All songs (admin sees hidden too) |
| `GET /api/songs/:id` | - | Single song |
| `PATCH /api/songs/:id` | Admin | Update song fields |
| `POST /api/upload/cover` | Admin | Image upload (multer → data/uploads/) |
| `POST /api/admin/login` | - | Password auth → cookie |
| `POST /api/admin/logout` | - | Clear cookie |
| `GET /api/admin/verify` | - | Check auth status |
| `GET /api/playlists` | - | All playlists |

Admin password is set via `ADMIN_PASSWORD` env var (default: `admin`).

### Admin Edit Mode

When authenticated, the UI exposes:
- **Eye/EyeOff toggle** on SongCard and SongTableRow for visibility
- **Edit button** on SongDetail → opens SongEditSheet (right slide-in Sheet panel)
- SongEditSheet: edit title, artist, genre, tags (chip-style add/remove), prompt, cover image (URL or file upload), visibility

### Path Aliases (tsconfig.json)

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

Shared types in `shared/types.ts` define `Song` (with `visible: boolean`), `Playlist`, `ViewMode`, `SortBy`, `RepeatMode`.

## Design System

FGO (Fate/Grand Order) inspired luxury aesthetic. Colors: gold `#D4AF37`, deep purple `#6B21A8`, crimson `#DC2626`, midnight blue `#1E1B4B`.

Fonts: `font-display` (Cinzel), `font-elegant` (Cormorant Garamond), Inter (body), JetBrains Mono (data).

Custom CSS classes: `.ornate-card`, `.gold-glow`, `.gradient-text`, `.btn-luxurious`, `.elegant-shadow`, `.mystical-particles`. Animations are slow (0.6-1.0s) for elegance, using Framer Motion with ease curve `[0.25, 0.46, 0.45, 0.94]`.

## Deployment

Vercel deploys as static SPA (`dist/public/` with SPA rewrites). Admin features (API writes, file upload) only work in local/VPS environments since Vercel has no persistent filesystem. The `vercel.json` uses `pnpm install --no-frozen-lockfile` and `pnpm vite build`.

## No Tests

Vitest is in devDependencies but no test files exist yet.
