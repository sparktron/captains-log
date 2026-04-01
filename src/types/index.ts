import { z } from 'zod'

// ── Boat ─────────────────────────────────────────────────────────────────────

export const BoatSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Boat name is required'),
  type: z.string().min(1, 'Vessel type is required'),
  lengthFt: z.number().positive('Length must be positive'),
  documentationNumber: z.string().default(''),
})

export type Boat = z.infer<typeof BoatSchema>

export const BoatFormSchema = BoatSchema.omit({ id: true })
export type BoatForm = z.infer<typeof BoatFormSchema>

// ── CrewMember ────────────────────────────────────────────────────────────────

export const CrewMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['captain', 'mate', 'crew', 'observer']),
  licenseNumber: z.string().default(''),
  notes: z.string().default(''),
})

export type CrewMember = z.infer<typeof CrewMemberSchema>

export const CrewMemberFormSchema = CrewMemberSchema.omit({ id: true })
export type CrewMemberForm = z.infer<typeof CrewMemberFormSchema>

// ── LogEntry ──────────────────────────────────────────────────────────────────

export const LogEntrySchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  boatId: z.string().uuid('Select a boat'),
  departureLocation: z.string().min(1, 'Departure location is required'),
  arrivalLocation: z.string().min(1, 'Arrival location is required'),
  route: z.string().min(1, 'Route description is required'),
  hoursUnderway: z
    .number()
    .positive('Hours must be positive')
    .max(24, 'Cannot exceed 24 hours'),
  conditions: z.string().default(''),
  crewIds: z.array(z.string().uuid()).default([]),
  notes: z.string().default(''),
  createdAt: z.string().datetime(),
})

export type LogEntry = z.infer<typeof LogEntrySchema>

export const LogEntryFormSchema = LogEntrySchema.omit({ id: true, createdAt: true })
export type LogEntryForm = z.infer<typeof LogEntryFormSchema>

// ── License requirements ──────────────────────────────────────────────────────

export const LICENSE_REQUIREMENTS = {
  OUPV: 360,      // 6-pack / OUPV: 360 days on water
  MASTER_25: 360, // Master ≤25 GT: 360 days
  MASTER_50: 720, // Master ≤50 GT: 720 days
} as const

export type LicenseType = keyof typeof LICENSE_REQUIREMENTS
