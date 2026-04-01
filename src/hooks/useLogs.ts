import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  getAllLogs,
  putLog,
  deleteLog,
  getTotalHours,
  getAllBoats,
  putBoat,
  deleteBoat,
  getAllCrew,
  putCrewMember,
  deleteCrewMember,
  getCrewHours,
} from '@/db'
import type { LogEntry, LogEntryForm, Boat, BoatForm, CrewMember, CrewMemberForm } from '@/types'

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [all, hours] = await Promise.all([getAllLogs(), getTotalHours()])
    setLogs(all)
    setTotalHours(hours)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addLog = useCallback(
    async (form: LogEntryForm): Promise<LogEntry> => {
      const entry: LogEntry = {
        ...form,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      }
      await putLog(entry)
      await refresh()
      return entry
    },
    [refresh],
  )

  const updateLog = useCallback(
    async (id: string, form: LogEntryForm): Promise<void> => {
      const existing = logs.find((l) => l.id === id)
      if (!existing) throw new Error('Log entry not found')
      await putLog({ ...existing, ...form })
      await refresh()
    },
    [logs, refresh],
  )

  const removeLog = useCallback(
    async (id: string): Promise<void> => {
      await deleteLog(id)
      await refresh()
    },
    [refresh],
  )

  return { logs, totalHours, loading, addLog, updateLog, removeLog, refresh }
}

export function useBoats() {
  const [boats, setBoats] = useState<Boat[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setBoats(await getAllBoats())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addBoat = useCallback(
    async (form: BoatForm): Promise<Boat> => {
      const boat: Boat = { ...form, id: uuidv4() }
      await putBoat(boat)
      await refresh()
      return boat
    },
    [refresh],
  )

  const updateBoat = useCallback(
    async (id: string, form: BoatForm): Promise<void> => {
      await putBoat({ ...form, id })
      await refresh()
    },
    [refresh],
  )

  const removeBoat = useCallback(
    async (id: string): Promise<void> => {
      await deleteBoat(id)
      await refresh()
    },
    [refresh],
  )

  return { boats, loading, addBoat, updateBoat, removeBoat, refresh }
}

export function useCrew() {
  const [crew, setCrew] = useState<CrewMember[]>([])
  const [crewHours, setCrewHours] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [members, hours] = await Promise.all([getAllCrew(), getCrewHours()])
    setCrew(members)
    setCrewHours(hours)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addCrewMember = useCallback(
    async (form: CrewMemberForm): Promise<CrewMember> => {
      const member: CrewMember = { ...form, id: uuidv4() }
      await putCrewMember(member)
      await refresh()
      return member
    },
    [refresh],
  )

  const updateCrewMember = useCallback(
    async (id: string, form: CrewMemberForm): Promise<void> => {
      await putCrewMember({ ...form, id })
      await refresh()
    },
    [refresh],
  )

  const removeCrewMember = useCallback(
    async (id: string): Promise<void> => {
      await deleteCrewMember(id)
      await refresh()
    },
    [refresh],
  )

  return { crew, crewHours, loading, addCrewMember, updateCrewMember, removeCrewMember, refresh }
}
