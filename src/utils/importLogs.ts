/**
 * Log import utility.
 *
 * Accepts a parsed JSON value, validates it against the import schema,
 * then resolves boat and crew references by name (find-or-create) and
 * writes new LogEntry records to IndexedDB.
 *
 * Import format uses human-readable names instead of UUIDs so users can
 * author files without knowing internal IDs.
 */
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { getAllBoats, putBoat, getAllCrew, putCrewMember, putLog, getAllLogs } from '@/db'
import type { Boat, CrewMember, LogEntry } from '@/types'

// ── Import file schema ────────────────────────────────────────────────────────

const ImportVesselSchema = z.object({
  name: z.string().min(1, 'Vessel name is required'),
  type: z.string().default('powerboat'),
  lengthFt: z.number().positive('Length must be positive'),
  documentationNumber: z.string().optional().default(''),
})

const ImportCrewSchema = z.object({
  name: z.string().min(1, 'Crew name is required'),
  role: z.enum(['captain', 'mate', 'crew', 'observer']).default('crew'),
  licenseNumber: z.string().optional().default(''),
  notes: z.string().optional().default(''),
})

export const ImportEntrySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  vessel: ImportVesselSchema,
  departureLocation: z.string().min(1, 'Departure location is required'),
  arrivalLocation: z.string().min(1, 'Arrival location is required'),
  route: z.string().min(1, 'Route is required'),
  hoursUnderway: z
    .number()
    .positive('Hours must be positive')
    .max(24, 'Cannot exceed 24 hours in a day'),
  conditions: z.string().optional().default(''),
  crew: z.array(ImportCrewSchema).optional().default([]),
  notes: z.string().optional().default(''),
})

export const ImportFileSchema = z.object({
  version: z.literal(1, { errorMap: () => ({ message: 'File version must be 1' }) }),
  entries: z.array(ImportEntrySchema).min(1, 'File must contain at least one entry'),
})

export type ImportEntry = z.infer<typeof ImportEntrySchema>
export type ImportFile = z.infer<typeof ImportFileSchema>

// ── Result types ──────────────────────────────────────────────────────────────

export interface ImportResult {
  /** Number of log entries successfully written */
  imported: number
  /** Number of entries skipped because they already exist (same date + route) */
  skipped: number
  /** Boats that were newly created during this import */
  newBoats: string[]
  /** Crew members that were newly created during this import */
  newCrew: string[]
  /** Per-entry validation or write errors */
  errors: Array<{ index: number; date?: string; message: string }>
}

// ── Core import function ──────────────────────────────────────────────────────

export async function importLogFile(raw: unknown): Promise<ImportResult> {
  // 1. Validate the file structure
  const parsed = ImportFileSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join('; ')
    throw new Error(`Invalid import file: ${msg}`)
  }

  const { entries } = parsed.data
  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    newBoats: [],
    newCrew: [],
    errors: [],
  }

  // 2. Load current state once (avoid redundant DB calls per entry)
  let boats = await getAllBoats()
  let crew = await getAllCrew()
  const existingLogs = await getAllLogs()

  // Build lookup sets for dedup-checking
  const existingKeys = new Set(
    existingLogs.map((l) => `${l.date}::${l.route.trim().toLowerCase()}`)
  )

  // Helpers — normalise by lowercase name to avoid "sea witch" vs "Sea Witch"
  const findBoat = (name: string) =>
    boats.find((b) => b.name.toLowerCase() === name.toLowerCase())

  const findCrew = (name: string) =>
    crew.find((c) => c.name.toLowerCase() === name.toLowerCase())

  // 3. Process each entry
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]

    try {
      // Dedup: skip if we already have an entry on this date with the same route
      const key = `${entry.date}::${entry.route.trim().toLowerCase()}`
      if (existingKeys.has(key)) {
        result.skipped++
        continue
      }

      // ── Resolve / create boat ──────────────────────────────────────────────
      let boat = findBoat(entry.vessel.name)
      if (!boat) {
        boat = {
          id: uuidv4(),
          name: entry.vessel.name,
          type: entry.vessel.type,
          lengthFt: entry.vessel.lengthFt,
          documentationNumber: entry.vessel.documentationNumber,
        } satisfies Boat
        await putBoat(boat)
        boats = [...boats, boat] // keep in-memory list fresh
        result.newBoats.push(boat.name)
      }

      // ── Resolve / create crew ──────────────────────────────────────────────
      const crewIds: string[] = []
      for (const importedMember of entry.crew) {
        let member = findCrew(importedMember.name)
        if (!member) {
          member = {
            id: uuidv4(),
            name: importedMember.name,
            role: importedMember.role,
            licenseNumber: importedMember.licenseNumber,
            notes: importedMember.notes,
          } satisfies CrewMember
          await putCrewMember(member)
          crew = [...crew, member]
          result.newCrew.push(member.name)
        }
        crewIds.push(member.id)
      }

      // ── Write log entry ────────────────────────────────────────────────────
      const log: LogEntry = {
        id: uuidv4(),
        date: entry.date,
        boatId: boat.id,
        departureLocation: entry.departureLocation,
        arrivalLocation: entry.arrivalLocation,
        route: entry.route,
        hoursUnderway: entry.hoursUnderway,
        conditions: entry.conditions,
        crewIds,
        notes: entry.notes,
        createdAt: new Date().toISOString(),
      }
      await putLog(log)
      existingKeys.add(key)
      result.imported++
    } catch (err) {
      result.errors.push({
        index: i + 1,
        date: entry.date,
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return result
}

// ── Parse raw file text ───────────────────────────────────────────────────────

export function parseImportJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('File is not valid JSON. Make sure it was saved as a .json file.')
  }
}
