# Captain's Log

## What this is
A mobile-first Progressive Web App (PWA) optimized for iOS that helps mariners track underway
hours toward a USCG captain's license (OUPV / Master). Each log entry captures the trip date,
boat, departure/arrival locations, route sailed, hours underway, and crew aboard — everything
an examiner expects to see in a documented sea service record.

## Tech stack
- **Language**: TypeScript
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS (mobile-first, iOS safe-area aware)
- **PWA**: Vite PWA plugin (`vite-plugin-pwa`) — offline capable, installable on iOS home screen
- **Storage**: IndexedDB via `idb` (local-first; no backend required)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Date handling**: date-fns
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library

## Directory layout (intended)
```
captains-log/
├── public/
│   ├── manifest.json        # PWA manifest (name, icons, display: standalone)
│   └── icons/               # App icons (192x192, 512x512, apple-touch-icon)
├── src/
│   ├── main.tsx             # App entry point
│   ├── App.tsx              # Root component + router
│   ├── db/
│   │   └── index.ts         # IndexedDB schema + CRUD helpers (idb)
│   ├── types/
│   │   └── index.ts         # Shared TypeScript types (LogEntry, Boat, CrewMember)
│   ├── pages/
│   │   ├── Dashboard.tsx    # Summary: total hours, recent trips, hours-to-license progress
│   │   ├── LogList.tsx      # Scrollable list of all log entries
│   │   ├── LogEntry.tsx     # Add / edit a single trip log
│   │   ├── Boats.tsx        # Manage boat profiles (name, type, length, documentation #)
│   │   └── Crew.tsx         # Manage crew member contacts (name, license #, role)
│   ├── components/
│   │   ├── BottomNav.tsx    # iOS-style tab bar navigation
│   │   ├── LogCard.tsx      # Trip summary card for list view
│   │   ├── HoursProgress.tsx # Visual progress bar toward license hour requirements
│   │   └── CrewPicker.tsx   # Multi-select crew for a log entry
│   └── hooks/
│       └── useLogs.ts       # Custom hook for log CRUD + aggregations
├── tests/
│   └── logEntry.test.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

## Data model

### LogEntry
```ts
{
  id: string            // uuid
  date: string          // ISO date (YYYY-MM-DD)
  boatId: string        // FK → Boat.id
  departureLocation: string
  arrivalLocation: string
  route: string         // free-text description of route sailed
  hoursUnderway: number // decimal hours (e.g. 2.5)
  conditions: string    // optional: sea state, visibility, weather
  crewIds: string[]     // FK[] → CrewMember.id
  notes: string         // optional free text
  createdAt: string     // ISO datetime
}
```

### Boat
```ts
{
  id: string
  name: string
  type: string          // sailboat / powerboat / vessel type
  lengthFt: number
  documentationNumber: string  // optional USCG doc # or state reg #
}
```

### CrewMember
```ts
{
  id: string
  name: string
  role: string          // captain / mate / crew / observer
  licenseNumber: string // optional USCG license #
  notes: string
}
```

## Key commands
```bash
# Install deps
npm install

# Dev server (open on iPhone via local IP for real device testing)
npm run dev -- --host

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## iOS PWA notes
- Set `display: "standalone"` and `background_color` in `manifest.json`
- Include `<meta name="apple-mobile-web-app-capable" content="yes">` in `index.html`
- Use `env(safe-area-inset-bottom)` padding on the bottom nav to clear the iOS home indicator
- Test on real Safari — iOS PWA install only works from Safari, not Chrome
- Service worker must cache all assets for offline use (mariners are often without signal)

## Coding conventions
- All data types defined in `src/types/index.ts` — import from there, never redefine inline
- DB access only through `src/db/index.ts` helpers — no raw IndexedDB calls in components
- Use controlled forms via React Hook Form; validate with Zod schemas co-located with types
- Components stay under ~80 lines; extract sub-components freely
- Mobile-first CSS — design for 390px width (iPhone 14), then scale up if needed
- No backend calls — this is intentionally local-first; all data lives in IndexedDB
- Date display: always show human-readable format (e.g. "Mar 15, 2026") alongside ISO storage

## Guardrails
- Never commit `.env` or any API keys (none expected, but just in case)
- Don't add new dependencies without asking first — keep the bundle lean for PWA performance
- Never break offline capability — every feature must work without network
- Don't add a backend or auth layer unless explicitly requested
- Always validate user input with Zod before writing to IndexedDB
- Keep the UI thumb-friendly: minimum 44px tap targets, avoid hover-only interactions

## Current goal
Scaffold the project and get a working shell running on iOS:
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS with iOS safe-area utilities
3. Set up `vite-plugin-pwa` with proper `manifest.json` and service worker
4. Define all TypeScript types in `src/types/index.ts`
5. Set up IndexedDB schema in `src/db/index.ts` with CRUD for all three entity types
6. Build the bottom nav shell with 4 tabs: Dashboard, Log, Boats, Crew
7. Implement the LogEntry form (add/edit) with all fields
8. Implement the Dashboard page with total hours summary and recent trips
9. Add a smoke test that imports DB helpers without errors

Do not implement export/PDF generation or sync features until core logging is solid.
