import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { MapPin, Clock, ChevronRight } from 'lucide-react'
import type { LogEntry, Boat } from '@/types'

interface Props {
  entry: LogEntry
  boat?: Boat
}

export default function LogCard({ entry, boat }: Props) {
  return (
    <Link
      to={`/log/${entry.id}/edit`}
      className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 active:bg-slate-700"
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5 text-sm font-medium truncate">
          <MapPin size={13} className="shrink-0 text-sky-400" />
          <span className="truncate">
            {entry.departureLocation} → {entry.arrivalLocation}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{format(parseISO(entry.date), 'MMM d, yyyy')}</span>
          {boat && <span className="truncate">{boat.name}</span>}
        </div>
        {entry.conditions && (
          <p className="text-xs text-slate-500 truncate">{entry.conditions}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Clock size={13} className="text-slate-500" />
        <span className="text-sm font-semibold text-sky-400 tabular-nums">
          {entry.hoursUnderway.toFixed(1)}h
        </span>
        <ChevronRight size={14} className="text-slate-600 ml-1" />
      </div>
    </Link>
  )
}
