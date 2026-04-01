import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { useLogs, useBoats } from '@/hooks/useLogs'
import LogCard from '@/components/LogCard'

export default function LogList() {
  const { logs, loading } = useLogs()
  const { boats } = useBoats()

  const boatMap = Object.fromEntries(boats.map((b) => [b.id, b]))

  return (
    <div className="px-4 pt-6 pb-safe mb-nav max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Trip Log</h1>
        <Link
          to="/log/new"
          className="flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-sm font-medium text-white active:bg-sky-600"
        >
          <PlusCircle size={16} />
          New
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl bg-slate-800 p-8 text-center text-slate-400">
          <p className="mb-3">No trips logged yet.</p>
          <Link
            to="/log/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white"
          >
            <PlusCircle size={16} />
            Log your first trip
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((entry) => (
            <LogCard key={entry.id} entry={entry} boat={boatMap[entry.boatId]} />
          ))}
        </div>
      )}
    </div>
  )
}
