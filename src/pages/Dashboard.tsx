import { Link } from 'react-router-dom'
import { PlusCircle, Anchor } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import HoursProgress from '@/components/HoursProgress'
import { useLogs } from '@/hooks/useLogs'
import type { LicenseType } from '@/types'
import { useState } from 'react'
import { LICENSE_REQUIREMENTS } from '@/types'

const LICENSE_TYPES = Object.keys(LICENSE_REQUIREMENTS) as LicenseType[]

export default function Dashboard() {
  const { logs, totalHours, loading } = useLogs()
  const [licenseType, setLicenseType] = useState<LicenseType>('OUPV')
  const recentLogs = logs.slice(0, 5)

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

      {/* Total hours card */}
      <div className="rounded-2xl bg-slate-800 p-5 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-400">Total underway</p>
            <p className="text-4xl font-bold tabular-nums text-sky-400">
              {loading ? '–' : totalHours.toFixed(1)}
            </p>
            <p className="text-sm text-slate-400">hours</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Trips logged</p>
            <p className="text-3xl font-bold tabular-nums">{loading ? '–' : logs.length}</p>
          </div>
        </div>

        {/* License selector */}
        <div className="flex gap-2 flex-wrap">
          {LICENSE_TYPES.map((lt) => (
            <button
              key={lt}
              onClick={() => setLicenseType(lt)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                licenseType === lt
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-700 text-slate-300 active:bg-slate-600'
              }`}
            >
              {lt.replace('_', ' ')}
            </button>
          ))}
        </div>

        <HoursProgress totalHours={totalHours} licenseType={licenseType} />
      </div>

      {/* Recent trips */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-200">Recent Trips</h2>
          <Link to="/log" className="text-sm text-sky-400">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
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
            {recentLogs.map((log) => (
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
                  </p>
                </div>
                <span className="ml-3 shrink-0 text-sm font-semibold text-sky-400 tabular-nums">
                  {log.hoursUnderway.toFixed(1)}h
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
