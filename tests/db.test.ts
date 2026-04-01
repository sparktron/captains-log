/**
 * Smoke tests for the IndexedDB CRUD helpers.
 * Uses fake-indexeddb (bundled with idb's test utilities) via the structured-clone
 * polyfill that jsdom provides.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { resetDb, putLog, getLog, getAllLogs, deleteLog, getTotalHours, putBoat, getAllBoats, deleteBoat, putCrewMember, getAllCrew, deleteCrewMember } from '../src/db'
import type { LogEntry, Boat, CrewMember } from '../src/types'

beforeEach(() => {
  resetDb()
})

const makeLog = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  id: 'aaaaaaaa-0000-4000-8000-000000000001',
  date: '2026-03-01',
  boatId: 'bbbbbbbb-0000-4000-8000-000000000001',
  departureLocation: 'Newport',
  arrivalLocation: 'Block Island',
  route: 'Direct passage via East Passage',
  hoursUnderway: 4.5,
  conditions: 'Calm, 5kts SW',
  crewIds: [],
  notes: '',
  createdAt: new Date().toISOString(),
  ...overrides,
})

const makeBoat = (overrides: Partial<Boat> = {}): Boat => ({
  id: 'bbbbbbbb-0000-4000-8000-000000000001',
  name: 'Sea Witch',
  type: 'sailboat',
  lengthFt: 38,
  documentationNumber: 'USC-12345',
  ...overrides,
})

const makeCrew = (overrides: Partial<CrewMember> = {}): CrewMember => ({
  id: 'cccccccc-0000-4000-8000-000000000001',
  name: 'Jane Doe',
  role: 'mate',
  licenseNumber: '',
  notes: '',
  ...overrides,
})

describe('Log entries', () => {
  it('stores and retrieves a log entry', async () => {
    const entry = makeLog()
    await putLog(entry)
    const result = await getLog(entry.id)
    expect(result).toEqual(entry)
  })

  it('returns undefined for a missing entry', async () => {
    const result = await getLog('does-not-exist')
    expect(result).toBeUndefined()
  })

  it('lists all logs', async () => {
    await putLog(makeLog({ id: 'aaaaaaaa-0000-4000-8000-000000000001', date: '2026-03-01' }))
    await putLog(makeLog({ id: 'aaaaaaaa-0000-4000-8000-000000000002', date: '2026-03-15' }))
    const logs = await getAllLogs()
    expect(logs).toHaveLength(2)
    // most recent first
    expect(logs[0].date >= logs[1].date).toBe(true)
  })

  it('deletes a log entry', async () => {
    const entry = makeLog()
    await putLog(entry)
    await deleteLog(entry.id)
    expect(await getLog(entry.id)).toBeUndefined()
  })

  it('sums total hours', async () => {
    await putLog(makeLog({ id: 'aaaaaaaa-0000-4000-8000-000000000001', hoursUnderway: 4.5 }))
    await putLog(makeLog({ id: 'aaaaaaaa-0000-4000-8000-000000000002', hoursUnderway: 2.25 }))
    expect(await getTotalHours()).toBeCloseTo(6.75)
  })

  it('updates an existing entry', async () => {
    const entry = makeLog({ hoursUnderway: 3 })
    await putLog(entry)
    await putLog({ ...entry, hoursUnderway: 5 })
    const updated = await getLog(entry.id)
    expect(updated?.hoursUnderway).toBe(5)
  })
})

describe('Boats', () => {
  it('stores and lists boats', async () => {
    const boat = makeBoat()
    await putBoat(boat)
    const all = await getAllBoats()
    expect(all).toHaveLength(1)
    expect(all[0]).toEqual(boat)
  })

  it('deletes a boat', async () => {
    const boat = makeBoat()
    await putBoat(boat)
    await deleteBoat(boat.id)
    expect(await getAllBoats()).toHaveLength(0)
  })
})

describe('Crew members', () => {
  it('stores and lists crew members', async () => {
    const member = makeCrew()
    await putCrewMember(member)
    const all = await getAllCrew()
    expect(all).toHaveLength(1)
    expect(all[0]).toEqual(member)
  })

  it('deletes a crew member', async () => {
    const member = makeCrew()
    await putCrewMember(member)
    await deleteCrewMember(member.id)
    expect(await getAllCrew()).toHaveLength(0)
  })
})
