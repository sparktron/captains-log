import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Boat, CrewMember, LogEntry } from '@/types'

interface CaptainsLogDB extends DBSchema {
  logs: {
    key: string
    value: LogEntry
    indexes: { 'by-date': string }
  }
  boats: {
    key: string
    value: Boat
  }
  crew: {
    key: string
    value: CrewMember
  }
}

const DB_NAME = 'captains-log'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<CaptainsLogDB>> | null = null

export function getDb(): Promise<IDBPDatabase<CaptainsLogDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CaptainsLogDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // logs store
        const logStore = db.createObjectStore('logs', { keyPath: 'id' })
        logStore.createIndex('by-date', 'date')

        // boats store
        db.createObjectStore('boats', { keyPath: 'id' })

        // crew store
        db.createObjectStore('crew', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

// ── Log entries ───────────────────────────────────────────────────────────────

export async function getAllLogs(): Promise<LogEntry[]> {
  const db = await getDb()
  const logs = await db.getAllFromIndex('logs', 'by-date')
  return logs.reverse() // most recent first
}

export async function getLog(id: string): Promise<LogEntry | undefined> {
  const db = await getDb()
  return db.get('logs', id)
}

export async function putLog(entry: LogEntry): Promise<void> {
  const db = await getDb()
  await db.put('logs', entry)
}

export async function deleteLog(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('logs', id)
}

export async function getTotalHours(): Promise<number> {
  const logs = await getAllLogs()
  return logs.reduce((sum, log) => sum + log.hoursUnderway, 0)
}

// ── Boats ─────────────────────────────────────────────────────────────────────

export async function getAllBoats(): Promise<Boat[]> {
  const db = await getDb()
  return db.getAll('boats')
}

export async function getBoat(id: string): Promise<Boat | undefined> {
  const db = await getDb()
  return db.get('boats', id)
}

export async function putBoat(boat: Boat): Promise<void> {
  const db = await getDb()
  await db.put('boats', boat)
}

export async function deleteBoat(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('boats', id)
}

// ── Crew members ──────────────────────────────────────────────────────────────

export async function getAllCrew(): Promise<CrewMember[]> {
  const db = await getDb()
  return db.getAll('crew')
}

export async function getCrewMember(id: string): Promise<CrewMember | undefined> {
  const db = await getDb()
  return db.get('crew', id)
}

export async function putCrewMember(member: CrewMember): Promise<void> {
  const db = await getDb()
  await db.put('crew', member)
}

export async function deleteCrewMember(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('crew', id)
}

// ── Reset (for testing) ───────────────────────────────────────────────────────

export function resetDb(): void {
  dbPromise = null
}
