import { Link } from 'react-router-dom'
import { PlusCircle, Anchor, Clock, Ship, ChevronRight, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useLogs, useBoats, useCrew } from '@/hooks/useLogs'

export default function Dashboard() {
  const { logs, totalHours, loading } = useLogs()
  const { boats } = useBoats()
  const { crew, crewHours } = useCrew()

  const boatMap = Object.fromEntries(boats.map((b) => [b.id, b]))
  const recentLogs = logs.slice(0, 5)

  const topCrew = crew
    .filter((m) => (crewHours[m.id] ?? 0) > 0)
    .sort((a, b) => (crewHours[b.id] ?? 0) - (crewHours[a.id] ?? 0))
    .slice(0, 4)

  return (
    <div className="px-4 pt-5 pb-safe mb-nav space-y-5 max-w-lg mx-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', boxShadow: '0 2px 12px rgba(14,165,233,0.4)' }}>
            <Anchor size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Captain's Log</h1>
            <p className="text-[0.7rem] text-slate-500 mt-0.5">Sea service record</p>
          </div>
        </div>
        <Link to="/log/new" className="btn-pill">
          <PlusCircle size={14} />
          New Entry
        </Link>
      </div>

      {/* ── Hero stats ── */}
      <div className="card p-5 glow-ring-amber" style={{ background: 'linear-gradient(145deg, #0d1f35 0%, #0a1628 100%)' }}>
        {/* Hours — main hero */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="section-label mb-2">Total underway</p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl font-black tabular-nums leading-none"
                style={{ color: '#fbbf24', textShadow: '0 0 30px rgba(251,191,36,0.4)' }}
              >
                {loading ? '–' : totalHours.toFixed(1)}
              </span>
              <span className="text-xl font-semibold text-amber-400/60">hrs</span>
            </div>
          </div>

          <div className="text-right">
            <p className="section-label mb-2">Trips</p>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-3xl font-bold tabular-nums text-sky-400 leading-none">
                {loading ? '–' : logs.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">logged</p>
          </div>
        </div>

        {/* Divider */}
        <div className="divider mb-4" />

        {/* Quick stats row */}
        <div className="grid grid-cols-2 gap-3">
          <StatChip
            icon={<Ship size={13} />}
            label="Vessels"
            value={String(boats.length)}
          />
          <StatChip
            icon={<Clock size={13} />}
            label="Avg / trip"
            value={logs.length ? `${(totalHours / logs.length).toFixed(1)}h` : '–'}
          />
        </div>
      </div>

      {/* ── Crew leaderboard ── */}
      {topCrew.length > 0 && (
        <section className="animate-slide-up">
          <SectionHeader title="Crew Hours" linkTo="/crew" />
          <div className="card divide-y divide-[rgba(56,189,248,0.07)]">
            {topCrew.map((member, i) => (
              <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs font-bold text-slate-600 w-4 text-center">{i + 1}</span>
                <Avatar name={member.name} size="sm" />
                <p className="flex-1 text-sm font-medium truncate">{member.name}</p>
                <div className="flex items-center gap-1">
                  <Clock size={11} className="text-amber-400/70" />
                  <span className="text-sm font-bold tabular-nums text-amber-400">
                    {(crewHours[member.id] ?? 0).toFixed(1)}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent trips ── */}
      <section className="animate-slide-up">
        <SectionHeader title="Recent Trips" linkTo="/log" />

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[4.5rem] rounded-2xl bg-navy-700/50 animate-pulse" />
            ))}
          </div>
        ) : recentLogs.length === 0 ? (
          <EmptyTrips />
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const boat = boatMap[log.boatId]
              return (
                <Link
                  key={log.id}
                  to={`/log/${log.id}/edit`}
                  className="card flex items-center gap-3 px-4 py-3.5 active:opacity-80 transition-opacity"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-semibold truncate mb-0.5">
                      <span className="truncate">{log.departureLocation}</span>
                      <ArrowRight size={12} className="shrink-0 text-sky-500" />
                      <span className="truncate">{log.arrivalLocation}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {format(parseISO(log.date), 'MMM d, yyyy')}
                      {boat && <> · <span className="text-slate-400">{boat.name}</span> <span className="text-slate-600">({boat.lengthFt}ft)</span></>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-bold tabular-nums" style={{ color: '#fbbf24' }}>
                      {log.hoursUnderway.toFixed(1)}h
                    </span>
                    <ChevronRight size={14} className="text-slate-600" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, linkTo }: { title: string; linkTo: string }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <h2 className="text-sm font-bold text-slate-300 tracking-wide">{title}</h2>
      <Link to={linkTo} className="flex items-center gap-0.5 text-xs text-sky-500 font-medium">
        View all <ChevronRight size={12} />
      </Link>
    </div>
  )
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-inset flex items-center gap-2 px-3 py-2.5">
      <span className="text-sky-400/70">{icon}</span>
      <div>
        <p className="text-[0.65rem] text-slate-500 uppercase tracking-wide font-semibold leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-200 tabular-nums">{value}</p>
      </div>
    </div>
  )
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  // Deterministic color from name
  const colors = [
    ['#0ea5e9', '#0369a1'], // sky
    ['#8b5cf6', '#6d28d9'], // violet
    ['#10b981', '#047857'], // emerald
    ['#f59e0b', '#b45309'], // amber
    ['#ef4444', '#b91c1c'], // red
    ['#ec4899', '#be185d'], // pink
  ]
  const idx = name.charCodeAt(0) % colors.length
  const [from, to] = colors[idx]
  const sz = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-11 w-11 text-base' : 'h-9 w-9 text-sm'

  return (
    <div
      className={`${sz} shrink-0 flex items-center justify-center rounded-full font-bold text-white`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 2px 8px ${from}55` }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function EmptyTrips() {
  return (
    <div className="card p-8 text-center">
      <div className="flex justify-center mb-3">
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
          <Anchor size={24} className="text-sky-400/60" />
        </div>
      </div>
      <p className="text-slate-400 font-medium mb-1">No trips logged yet</p>
      <p className="text-xs text-slate-600 mb-4">Start tracking your sea service hours</p>
      <Link to="/log/new"
        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 2px 10px rgba(14,165,233,0.3)' }}>
        <PlusCircle size={15} />
        Log your first trip
      </Link>
    </div>
  )
}
