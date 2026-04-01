import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { clearDb, getAllLogs, getAllBoats, getAllCrew } from '../src/db'
import { importLogFile, parseImportJson } from '../src/utils/importLogs'

beforeEach(async () => {
  await clearDb()
})

// ── Minimal valid payload ─────────────────────────────────────────────────────

const oneEntry = {
  version: 1 as const,
  entries: [
    {
      date: '2026-03-01',
      vessel: { name: 'Sea Witch', type: 'sailboat', lengthFt: 38 },
      departureLocation: 'Newport, RI',
      arrivalLocation: 'Block Island, RI',
      route: 'East Passage south to Great Salt Pond',
      hoursUnderway: 4.5,
      conditions: '10-15 kt SW',
      crew: [
        { name: 'Jane Doe', role: 'mate' as const },
        { name: 'Bob Smith', role: 'crew' as const },
      ],
      notes: 'Great day',
    },
  ],
}

// ── parseImportJson ────────────────────────────────────────────────────────────

describe('parseImportJson', () => {
  it('parses valid JSON', () => {
    const result = parseImportJson(JSON.stringify({ version: 1, entries: [] }))
    expect(result).toEqual({ version: 1, entries: [] })
  })

  it('throws on malformed JSON', () => {
    expect(() => parseImportJson('not json {')).toThrow(/valid JSON/i)
  })
})

// ── importLogFile ─────────────────────────────────────────────────────────────

describe('importLogFile', () => {
  it('throws on invalid file structure', async () => {
    await expect(importLogFile({ version: 2, entries: [] })).rejects.toThrow(/invalid import file/i)
  })

  it('throws when version is missing', async () => {
    await expect(importLogFile({ entries: oneEntry.entries })).rejects.toThrow(/invalid import file/i)
  })

  it('imports a single entry and creates boat + crew', async () => {
    const result = await importLogFile(oneEntry)

    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(0)
    expect(result.errors).toHaveLength(0)
    expect(result.newBoats).toContain('Sea Witch')
    expect(result.newCrew).toContain('Jane Doe')
    expect(result.newCrew).toContain('Bob Smith')

    const logs = await getAllLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0].hoursUnderway).toBe(4.5)
    expect(logs[0].crewIds).toHaveLength(2)
  })

  it('creates a Boat record in IndexedDB', async () => {
    await importLogFile(oneEntry)
    const boats = await getAllBoats()
    expect(boats).toHaveLength(1)
    expect(boats[0].name).toBe('Sea Witch')
    expect(boats[0].lengthFt).toBe(38)
  })

  it('creates CrewMember records in IndexedDB', async () => {
    await importLogFile(oneEntry)
    const crew = await getAllCrew()
    const names = crew.map((c) => c.name)
    expect(names).toContain('Jane Doe')
    expect(names).toContain('Bob Smith')
  })

  it('reuses existing boat if name matches (case-insensitive)', async () => {
    await importLogFile(oneEntry)
    // Import again with different casing
    const second = {
      version: 1 as const,
      entries: [{
        ...oneEntry.entries[0],
        date: '2026-03-02',
        route: 'A different route entirely',
        vessel: { ...oneEntry.entries[0].vessel, name: 'sea witch' },
        crew: [],
      }],
    }
    await importLogFile(second)
    const boats = await getAllBoats()
    expect(boats).toHaveLength(1) // still only one boat
  })

  it('reuses existing crew member if name matches (case-insensitive)', async () => {
    await importLogFile(oneEntry)
    const second = {
      version: 1 as const,
      entries: [{
        ...oneEntry.entries[0],
        date: '2026-03-02',
        route: 'Another route',
        crew: [{ name: 'jane doe', role: 'crew' as const }],
      }],
    }
    await importLogFile(second)
    const crew = await getAllCrew()
    expect(crew.filter((c) => c.name.toLowerCase() === 'jane doe')).toHaveLength(1)
  })

  it('skips duplicate entries (same date + route)', async () => {
    await importLogFile(oneEntry)
    const result = await importLogFile(oneEntry) // import same data again
    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(1)
    const logs = await getAllLogs()
    expect(logs).toHaveLength(1)
  })

  it('imports multiple entries', async () => {
    const multi = {
      version: 1 as const,
      entries: [
        oneEntry.entries[0],
        {
          ...oneEntry.entries[0],
          date: '2026-03-08',
          route: 'Block Island to Stonington',
          hoursUnderway: 6.0,
          crew: [],
        },
      ],
    }
    const result = await importLogFile(multi)
    expect(result.imported).toBe(2)
    const logs = await getAllLogs()
    expect(logs).toHaveLength(2)
  })

  it('imports an entry with no crew', async () => {
    const noCrew = {
      version: 1 as const,
      entries: [{ ...oneEntry.entries[0], crew: [] }],
    }
    const result = await importLogFile(noCrew)
    expect(result.imported).toBe(1)
    const logs = await getAllLogs()
    expect(logs[0].crewIds).toHaveLength(0)
  })

  it('correctly sums hours for imported entries', async () => {
    const multi = {
      version: 1 as const,
      entries: [
        oneEntry.entries[0],
        { ...oneEntry.entries[0], date: '2026-03-09', route: 'Different route', hoursUnderway: 2.5, crew: [] },
      ],
    }
    await importLogFile(multi)
    const logs = await getAllLogs()
    const total = logs.reduce((s, l) => s + l.hoursUnderway, 0)
    expect(total).toBeCloseTo(7.0)
  })
})
