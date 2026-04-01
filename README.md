# ⚓ Captain's Log

A mobile-first **Progressive Web App (PWA)** for mariners tracking underway hours toward a USCG captain's license. Log every trip — vessel, route, departure/arrival, conditions, crew, and hours — then watch your progress bar tick toward OUPV or Master certification.

**Runs entirely offline. No account. No backend. Your data stays on your device.**

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
- [Installing on iOS (Home Screen)](#installing-on-ios-home-screen)
- [Usage Guide](#usage-guide)
- [Data Model](#data-model)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [License Requirements Reference](#license-requirements-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Trip logging** — capture date, vessel, departure/arrival locations, route sailed, hours underway, sea conditions, crew, and notes
- **Hours progress** — visual progress bar toward OUPV (6-pack), Master ≤25 GT, or Master ≤50 GT requirements
- **Boat profiles** — save vessel name, type, length, and USCG documentation / state registration number
- **Crew roster** — maintain a contact list of crew members with roles and license numbers; tap to add them to any trip
- **Offline-first** — Workbox service worker caches the entire app; works at sea with no signal
- **Installable PWA** — add to your iPhone home screen for a native app experience (no App Store required)
- **Local storage only** — all data lives in IndexedDB on your device; nothing is transmitted

---

## Screenshots

> _Add screenshots here once the app is running on a real device._

| Dashboard | Trip Log | New Entry |
|-----------|----------|-----------|
| Hours summary + progress bar | Chronological trip list | Full entry form |

---

## Quick Start

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18.x |
| npm | 9.x |

### 1 — Clone and install

```bash
git clone https://github.com/sparktron/captains-log.git
cd captains-log
npm install
```

### 2 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3 — Test on a real iPhone (recommended)

```bash
npm run dev -- --host
```

Vite will print a local network URL like `http://192.168.1.42:5173`. Open that URL in **Safari on your iPhone** — Chrome on iOS cannot install PWAs.

---

## Installing on iOS (Home Screen)

iOS only supports PWA installation from Safari.

1. Open the app's network URL in **Safari**
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. Give it a name and tap **Add**

The app icon will appear on your home screen. When launched from there it runs in standalone mode (no browser chrome) and works fully offline.

> **Note:** The status bar blends into the app via `viewport-fit=cover` and `apple-mobile-web-app-status-bar-style: black-translucent` — this is intentional for a native feel.

---

## Usage Guide

### Dashboard

The home screen shows:

- **Total hours underway** across all logged trips
- **Number of trips** logged
- **Progress bar** toward your target license — tap the license type buttons to switch between OUPV, Master ≤25 GT, and Master ≤50 GT
- **Recent trips** list (last 5) with quick-tap to edit

Tap **New Entry** (top right) or the **Log** tab to add a trip.

---

### Logging a Trip

Navigate to **Log → New** (or tap the `+` button on the Dashboard or Log tab).

Fill in the required fields:

| Field | Notes |
|-------|-------|
| **Date** | Defaults to today |
| **Vessel** | Choose from your saved boats |
| **Departed** | Name of marina, dock, anchorage, or waypoint |
| **Arrived** | Destination name |
| **Route sailed** | Free-text description of the course taken |
| **Hours underway** | Decimal hours, e.g. `4.5` — max 24 |
| **Conditions** _(optional)_ | Sea state, wind, visibility |
| **Crew aboard** _(optional)_ | Tap to select from your crew roster |
| **Notes** _(optional)_ | Any additional remarks |

Tap **Log Trip** to save. The entry is written immediately to IndexedDB and the Dashboard totals update.

To **edit or delete** an entry, tap it in the Log list. The trash icon (top right) deletes after confirmation.

---

### Managing Boats

Navigate to the **Boats** tab.

Tap **Add** to create a vessel profile:

| Field | Notes |
|-------|-------|
| **Name** | e.g. _Sea Witch_ |
| **Vessel type** | e.g. _sailboat_, _powerboat_, _trawler_ |
| **Length (ft)** | Overall length in feet |
| **Doc / Reg #** _(optional)_ | USCG documentation number or state registration |

Tap **Edit** on any boat to update it. Tap the trash icon to delete.

> Deleting a boat does **not** delete associated log entries, but the vessel name will no longer resolve in the log list.

---

### Managing Crew

Navigate to the **Crew** tab.

Tap **Add** to create a crew member profile:

| Field | Notes |
|-------|-------|
| **Name** | Full name |
| **Role** | `captain` / `mate` / `crew` / `observer` |
| **License #** _(optional)_ | USCG MMC or license number |
| **Notes** _(optional)_ | Any additional information |

Once saved, crew members appear in the **Crew aboard** picker on every new trip entry.

---

## Data Model

All data is stored locally in an **IndexedDB** database named `captains-log` (version 1). There are three object stores:

### `logs` — Trip log entries

```ts
{
  id: string            // UUID v4
  date: string          // ISO date: "YYYY-MM-DD"
  boatId: string        // FK → boats.id
  departureLocation: string
  arrivalLocation: string
  route: string         // free-text route description
  hoursUnderway: number // decimal hours, 0.25–24
  conditions: string    // optional: sea state, weather
  crewIds: string[]     // FK[] → crew.id
  notes: string         // optional free text
  createdAt: string     // ISO datetime (set on creation)
}
```

Indexed by `date` for chronological retrieval.

### `boats` — Vessel profiles

```ts
{
  id: string
  name: string
  type: string          // e.g. "sailboat", "powerboat"
  lengthFt: number
  documentationNumber: string  // USCG doc # or state reg #
}
```

### `crew` — Crew member contacts

```ts
{
  id: string
  name: string
  role: "captain" | "mate" | "crew" | "observer"
  licenseNumber: string // optional USCG license #
  notes: string
}
```

All writes are validated against **Zod schemas** before reaching the database. See [`src/types/index.ts`](src/types/index.ts) for the full schema definitions.

---

## Project Structure

```
captains-log/
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icons/               # App icons
├── src/
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Router + layout
│   ├── index.css            # Tailwind base + iOS safe-area utilities
│   ├── test-setup.ts        # Vitest global setup
│   ├── db/
│   │   └── index.ts         # IndexedDB schema + CRUD helpers
│   ├── types/
│   │   └── index.ts         # Zod schemas + TypeScript types
│   ├── pages/
│   │   ├── Dashboard.tsx    # Hours summary + progress + recent trips
│   │   ├── LogList.tsx      # Full trip log list
│   │   ├── LogEntry.tsx     # Add / edit trip form
│   │   ├── Boats.tsx        # Boat profile management
│   │   └── Crew.tsx         # Crew roster management
│   ├── components/
│   │   ├── BottomNav.tsx    # iOS-style tab bar
│   │   ├── LogCard.tsx      # Trip summary card
│   │   ├── HoursProgress.tsx # Progress bar toward license hours
│   │   └── CrewPicker.tsx   # Multi-select crew for a log entry
│   └── hooks/
│       └── useLogs.ts       # useLogs / useBoats / useCrew hooks
└── tests/
    ├── db.test.ts           # IndexedDB CRUD smoke tests
    └── logEntry.test.tsx    # LogEntry form component tests
```

---

## Development

### Available commands

```bash
# Start dev server (localhost only)
npm run dev

# Start dev server accessible on local network (for iPhone testing)
npm run dev -- --host

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Run tests (single pass)
npm test

# Run tests in watch mode
npm run test -- --watch

# Type check (no emit)
npx tsc --noEmit

# Lint
npm run lint
```

### Tech stack

| Concern | Library |
|---------|---------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 (mobile-first) |
| PWA | vite-plugin-pwa + Workbox |
| Storage | IndexedDB via `idb` |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Date utils | date-fns |
| Icons | Lucide React |
| Testing | Vitest + Testing Library + fake-indexeddb |

### Coding conventions

- **Types** — all shared types live in `src/types/index.ts`; never redefine them inline
- **DB access** — only through `src/db/index.ts` helpers; no raw IndexedDB calls in components
- **Forms** — controlled via React Hook Form; validated with co-located Zod schemas
- **Component size** — aim for ≤ 80 lines; extract sub-components freely
- **Mobile-first CSS** — design for 390 px (iPhone 14), then scale up
- **No backend** — intentionally local-first; never add network calls for data

### iOS safe-area utilities

Two custom Tailwind utilities handle the notch and home indicator:

```css
.pb-safe  /* padding-bottom: env(safe-area-inset-bottom) */
.pt-safe  /* padding-top: env(safe-area-inset-top) */
.mb-nav   /* bottom margin to clear the fixed tab bar */
```

Use `pb-safe` on the bottom nav and `mb-nav` on every page's scroll container.

### Adding new dependencies

Keep the bundle lean — it's a PWA that mariners use on slow/no connections. Before adding a package, check whether the functionality already exists in the stack. Open a discussion or PR if you think a new dep is warranted.

---

## Testing

Tests live in `tests/` and run with Vitest.

```bash
npm test          # single run
npm test -- --watch   # watch mode
npm test -- --coverage  # with coverage report
```

### Test files

| File | What it covers |
|------|----------------|
| `tests/db.test.ts` | IndexedDB CRUD for all three stores — put, get, list, delete, upsert, total hours aggregation |
| `tests/logEntry.test.tsx` | LogEntry form renders all fields, shows validation errors, populates boat/crew from hooks |

Tests use **`fake-indexeddb`** so they run in jsdom without a real browser and are fully isolated — each test resets the DB singleton via `resetDb()`.

---

## License Requirements Reference

The app tracks progress toward three USCG license thresholds:

| License | Requirement | Description |
|---------|-------------|-------------|
| **OUPV** (6-pack) | 360 hours | Operator of Uninspected Passenger Vessels |
| **Master ≤25 GT** | 360 hours | Near-coastal or inland waters |
| **Master ≤50 GT** | 720 hours | Near-coastal or inland waters |

> These figures represent the *sea service* (time underway) component only. Full USCG applications also require first aid / CPR certification, a physical, drug test, and character references. See [USCG National Maritime Center](https://www.dco.uscg.mil/nmc/) for authoritative requirements.

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes following the coding conventions above
3. Add or update tests — `npm test` must pass with no failures
4. Type-check: `npx tsc --noEmit` must exit clean
5. Open a pull request with a clear description of what changed and why

### What's in scope

- Improvements to the log entry form or data model
- Better offline UX, sync indicators, or conflict handling
- PDF / CSV export of sea service records
- Accessibility improvements
- Additional USCG license types or configurable hour targets

### What's out of scope (for now)

- Backend / sync / cloud storage — this is intentionally device-local
- Auth / accounts
- Native iOS/Android wrappers (Capacitor, etc.)

---

## License

MIT © sparktron
