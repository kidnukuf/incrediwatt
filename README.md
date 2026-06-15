# 🎳 Vegas Sweeps Navigator

> **Event management PWA for the Vegas Sweeps Funtime bowling tournament.**
> Built for real-world event day operations — check-in, roster management, and reporting — all from a mobile-first progressive web app.

---

## Overview

Vegas Sweeps Navigator is a full-stack web application that coordinates a multi-center bowling tournament across five distinct user roles. It runs as a PWA with offline support, QR-based check-in, and a real-time audit log — designed to work even when the venue Wi-Fi is unreliable.

---

## User Roles

| Role | URL Path | Access Level | Description |
|------|----------|-------------|-------------|
| **Event Director** | `/admin` | Full admin | Manage all bowlers, centers, leagues, events, doormen, and export data |
| **Program Director** | `/program-director` | Read + filter | League-scoped roster view and team completion status |
| **Team Captain** | `/captain` | Team-scoped | Manage team roster, verify member registration |
| **Doorman** | `/doorman` | Check-in only | QR code scanner + PIN fallback, real-time check-in card |
| **Bowler** | `/register` | Self-service | Register, claim profile, view QR ticket |

---

## Features

- **QR Code Check-In** — each bowler gets a unique QR token; doorman scans it and sees a full bowler card (name, center, team, lane, squad time)
- **PIN Fallback** — 10-digit scantron ID entry when QR scanning is unavailable
- **Real-Time Audit Log** — every check-in event is logged with doorman ID, timestamp, and method
- **CSV Export** — full roster, per-center roster, check-in status report, and audit log
- **Offline PWA** — service worker caches all routes; IndexedDB stores bowler/roster data for offline reads
- **Team Color-Coding** — gray (incomplete) → yellow (all registered) → green (captain verified)
- **Full Bowler Editor** — Event Director can edit all fields with no restrictions; all edits are logged
- **Sponsor Ad Banners** — placeholder slots on bowler and captain pages for event sponsors
- **Neon Vegas Theme** — dark background, gold/cyan accents, glow animations throughout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, Wouter |
| Backend | Node.js, Express 4, tRPC 11 |
| Database | MySQL / TiDB (via Drizzle ORM) |
| Auth | JWT sessions (app roles) + Manus OAuth |
| PWA | Service Worker, Web App Manifest, IndexedDB |
| Testing | Vitest (21 tests) |
| Build | Vite 6, pnpm |

---

## Project Structure

```
incrediwatt/
├── client/
│   ├── public/
│   │   ├── manifest.json       ← PWA manifest
│   │   ├── sw.js               ← Service worker (offline caching)
│   │   ├── icon-192.png        ← PWA icon
│   │   └── icon-512.png        ← PWA icon
│   └── src/
│       ├── pages/              ← One file per role/feature
│       │   ├── Home.tsx        ← Landing page with role selector
│       │   ├── AdminDashboard.tsx
│       │   ├── DoormanCheckIn.tsx
│       │   ├── TeamCaptain.tsx
│       │   ├── BowlerProfile.tsx
│       │   ├── BowlerRegistration.tsx
│       │   ├── ProgramDirector.tsx
│       │   └── ImportPage.tsx
│       ├── components/         ← Reusable UI components
│       └── index.css           ← Global neon theme
├── server/
│   ├── routers.ts              ← All tRPC procedures
│   ├── db.ts                   ← Database query helpers
│   ├── storage.ts              ← S3 file storage helpers
│   └── _core/                  ← Framework plumbing (auth, OAuth, SSE)
├── drizzle/
│   ├── schema.ts               ← Database tables and types
│   └── migrations/             ← SQL migration files
└── shared/
    └── types.ts                ← Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A MySQL or TiDB database

### Installation

```bash
git clone https://github.com/kidnukuf/incrediwatt
cd incrediwatt
pnpm install
```

### Environment Variables

Create a `.env` file in the project root with the following keys:

```
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your-random-secret-here
VITE_APP_ID=local-dev
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_NAME=Event Director
```

### Run in Development

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Run Tests

```bash
pnpm test
```

### Database Migration

After setting `DATABASE_URL`, apply the schema by running the SQL files in `drizzle/` against your database, or use Drizzle Kit:

```bash
pnpm drizzle-kit generate
# Then apply the generated SQL to your database
```

---

## Database Schema

The core tables are:

| Table | Purpose |
|-------|--------|
| `events` | Tournament event records |
| `bowling_centers` | Participating bowling centers |
| `leagues` | Leagues within each center |
| `teams` | Teams within each league |
| `bowlers` | Individual bowler records |
| `hotel_records` | Hotel/lodging info per bowler |
| `payment_records` | Payment tracking per bowler |
| `lane_assignments` | Lane assignments per team |
| `app_users` | Doorman and admin accounts |
| `checkin_tokens` | QR token records |
| `checkin_events` | Audit log of all check-ins |

---

## API Overview

All API calls go through tRPC at `/api/trpc`. Key procedure groups:

| Router | Key Procedures |
|--------|---------------|
| `event` | `active`, `create`, `update` |
| `bowlers` | `list`, `getById`, `update`, `stats` |
| `teams` | `list`, `getByCode`, `update` |
| `tokens` | `generate`, `validate`, `listByBowler` |
| `checkin` | `list`, `stats` |
| `appAuth` | `login`, `me`, `logout` |
| `doormen` | `list`, `create`, `toggle` |
| `export` | `csv` (full roster, per-center, check-in, audit) |

---

## Deployment

The app is a standard Node.js server. Build for production:

```bash
pnpm build
node dist/server/_core/index.js
```

Set `NODE_ENV=production` and ensure all environment variables are configured before starting.

The app is currently live at: **[https://vegasweeps-y8eywesk.manus.space](https://vegasweeps-y8eywesk.manus.space)**

---

## Quick Start

```bash
pnpm install
pnpm dev
```

---

## License

Private — all rights reserved. Built for Vegas Sweeps Funtime event operations.
