import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, BookOpen, Upload } from 'lucide-react'
import { useLogs, useBoats } from '@/hooks/useLogs'
import LogCard from '@/components/LogCard'
import ImportSheet from '@/components/ImportSheet'

export default function LogList() {
  const { logs, totalHours, loading, refresh } = useLogs()
  const { boats, refresh: refreshBoats } = useBoats()
  const boatMap = Object.fromEntries(boats.map((b) => [b.id, b]))
  const [showImport, setShowImport] = useState(false)

  const handleImported = async () => {
    await Promise.all([refresh(), refreshBoats()])
  }

  return (
    <div className="px-4 pt-5 pb-safe mb-nav max-w-lg mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', boxShadow: '0 2px 12px rgba(14,165,233,0.4)' }}>
            <BookOpen size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Trip Log</h1>
            {!loading && logs.length > 0 && (
              <p className="text-[0.7rem] text-slate-500 mt-0.5">
                {logs.length} {logs.length === 1 ? 'trip' : 'trips'} · {totalHours.toFixed(1)} hrs total
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Import button */}
          <button
            onClick={() => setShowImport(true)}
            title="Import from JSON"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <Upload size={15} className="text-violet-400" />
          </button>

          <Link to="/log/new" className="btn-pill">
            <PlusCircle size={14} />
            New
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[4.5rem] rounded-2xl animate-pulse" style={{ background: 'rgba(13,31,53,0.6)' }} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-10 text-center animate-slide-up">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
              <BookOpen size={24} className="text-sky-400/60" />
            </div>
          </div>
          <p className="text-slate-300 font-semibold mb-1">No trips logged yet</p>
          <p className="text-xs text-slate-600 mb-5">Every voyage starts with a single entry</p>
          <div className="flex flex-col gap-2 items-center">
            <Link
              to="/log/new"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 2px 10px rgba(14,165,233,0.3)' }}
            >
              <PlusCircle size={15} />
              Log your first trip
            </Link>
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400"
            >
              <Upload size={14} />
              or import from JSON
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 animate-slide-up">
          {logs.map((entry) => (
            <LogCard key={entry.id} entry={entry} boat={boatMap[entry.boatId]} />
          ))}
        </div>
      )}

      {showImport && (
        <ImportSheet
          onClose={() => setShowImport(false)}
          onImported={handleImported}
        />
      )}
    </div>
  )
}
