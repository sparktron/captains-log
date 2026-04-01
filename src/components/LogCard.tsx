import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ArrowRight, ChevronRight } from 'lucide-react'
import type { LogEntry, Boat } from '@/types'

interface Props {
  entry: LogEntry
  boat?: Boat
}

export default function LogCard({ entry, boat }: Props) {
  return (
    <Link
      to={`/log/${entry.id}/edit`}
      className="card flex items-center gap-3 px-4 py-4 active:opacity-75 transition-opacity"
    >
      {/* Date block */}
      <div
        className="shrink-0 flex flex-col items-center justify-center rounded-xl w-12 h-12"
        style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}
      >
        <span className="text-[0.6rem] font-bold text-sky-400/80 uppercase tracking-wide leading-none">
          {format(parseISO(entry.date), 'MMM')}
        </span>
        <span className="text-lg font-black text-sky-400 leading-tight tabular-nums">
          {format(parseISO(entry.date), 'd')}
        </span>
      </div>

      {/* Route + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-sm font-semibold text-slate-100 mb-0.5">
          <span className="truncate max-w-[35%]">{entry.departureLocation}</span>
          <ArrowRight size={11} className="shrink-0 text-sky-500" />
          <span className="truncate">{entry.arrivalLocation}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">
          {boat
            ? <><span className="text-slate-400">{boat.name}</span> <span className="text-slate-600">· {boat.type} · {boat.lengthFt}ft</span></>
            : <span className="italic text-slate-600">No vessel</span>
          }
        </p>
        {entry.conditions && (
          <p className="text-xs text-slate-600 truncate mt-0.5">{entry.conditions}</p>
        )}
      </div>

      {/* Hours + chevron */}
      <div className="shrink-0 flex items-center gap-1.5">
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.3)' }}
        >
          {entry.hoursUnderway.toFixed(1)}h
        </span>
        <ChevronRight size={13} className="text-slate-600" />
      </div>
    </Link>
  )
}
