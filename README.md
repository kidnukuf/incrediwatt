# Vegas Sweeps Navigator

**Event management PWA for the Vegas Sweeps Funtime bowling tournament.**

Built with React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL/TiDB.

## Roles

| Role | Path | Description |
|------|------|-------------|
| Event Director | `/admin` | Full admin — manage bowlers, centers, events, CSV export |
| Program Director | `/program-director` | League-scoped roster oversight |
| Team Captain | `/captain` | Manage team roster, verify members |
| Doorman | `/doorman` | QR + PIN check-in at the door |
| Bowler | `/register` | Self-registration and profile |

## Quick Start

```bash
pnpm install
pnpm dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — MySQL/TiDB connection string
- `JWT_SECRET` — session signing secret
- `VITE_APP_ID` — Manus OAuth app ID (or set to any string for local dev)

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui, Wouter
- **Backend**: Express 4, tRPC 11, Drizzle ORM
- **Database**: MySQL / TiDB
- **PWA**: Service Worker with IndexedDB offline cache
- **Auth**: JWT sessions (5 roles) + Manus OAuth

## Features

- QR code generation and scanning for bowler check-in
- Real-time audit log for all check-in events
- CSV export (full roster, per-center, check-in status, audit log)
- Offline-capable with IndexedDB caching
- Neon Vegas theme (dark bg, gold/cyan accents)
- Sponsor ad banner slots
- Team color-coding (gray → yellow → green by completion)
