import { Link } from 'react-router-dom'
import { PlusCircle, Anchor, Clock, Ship } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useLogs, useBoats, useCrew } from '@/hooks/useLogs'

export default function Dashboard() {
  const { logs, totalHours, loading } = useLogs()
  const { boats } = useBoats()
  const { crew, crewHours } = useCrew()

  const boatMap = Object.fromEntries(boats.map((b) => [b.id, b]))
  const recentLogs = logs.slice(0, 5)

  // top crew sorted by hours, only those with at least some time logged
  const topCrew = crew
    .filter((m) => (crewHours[m.id] ?? 0) > 0)
    .sort((a, b) => (crewHours[b.id] ?? 0) - (crewHours[a.id] ?? 0))
    .slice(0, 4)

  return (
    <div className="px-4 pt-6 pb-safe mb-nav space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Anchor className="text-sky-400" size={24} />
          <h1 className="text-xl font-bold tracking-tight">Captain's Log</h1>
        </div>
        <Link
          to="/log/new"
          className="flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-sm font-medium text-white active:bg-sky-600"
        >
          <PlusCircle size={16} />
          New Entry
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-800 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Clock size={13} />
            Total underway
          </div>
          <p className="text-4xl font-bold tabular-nums text-sky-400 leading-none">
            {loading ? '–' : totalHours.toFixed(1)}
          </p>
          <p className="text-sm text-slate-400">hours</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Ship size={13} />
            Trips logged
          </div>
          <p className="text-4xl font-bold tabular-nums leading-none">
            {loading ? '–' : logs.length}
          </p>
          <p className="text-sm text-slate-400">
            {logs.length === 1 ? 'trip' : 'trips'}
          </p>
        </div>
      </div>

      {/* Crew hours — only shown once anyone has time */}
      {topCrew.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-200">Crew Hours</h2>
            <Link to="/crew" className="text-sm text-sky-400">
              View all
            </Link>
          </div>
          <div className="rounded-2xl bg-slate-800 divide-y divide-slate-700">
            {topCrew.map((member) => (
              <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-sky-400">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 text-sm font-medium truncate">{member.name}</p>
                <span className="text-sm font-semibold text-sky-400 tabular-nums">
                  {(crewHours[member.id] ?? 0).toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent trips */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-200">Recent Trips</h2>
          <Link to="/log" className="text-sm text-sky-400">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="rounded-xl bg-slate-800 p-6 text-center text-slate-400">
            <p className="mb-2">No trips logged yet.</p>
            <Link to="/log/new" className="text-sky-400 text-sm">
              Log your first trip →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const boat = boatMap[log.boatId]
              return (
                <Link
                  key={log.id}
                  to={`/log/${log.id}/edit`}
                  className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3 active:bg-slate-700"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {log.departureLocation} → {log.arrivalLocation}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(parseISO(log.date), 'MMM d, yyyy')}
                      {boat && ` · ${boat.name}`}
                      {boat && ` (${boat.lengthFt}ft)`}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 text-sm font-semibold text-sky-400 tabular-nums">
                    {log.hoursUnderway.toFixed(1)}h
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
