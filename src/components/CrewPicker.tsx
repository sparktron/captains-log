import { Check, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CrewMember } from '@/types'

interface Props {
  crew: CrewMember[]
  selected: string[]
  onChange: (ids: string[]) => void
}

const ROLE_COLORS: Record<CrewMember['role'], string> = {
  captain: '#f59e0b',
  mate:    '#38bdf8',
  crew:    '#a3e635',
  observer:'#94a3b8',
}

export default function CrewPicker({ crew, selected, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  if (crew.length === 0) {
    return (
      <div className="py-3 px-2 text-center">
        <p className="text-xs text-slate-500 mb-2">No crew members saved yet.</p>
        <Link
          to="/crew"
          className="inline-flex items-center gap-1 text-xs text-sky-400 font-medium"
        >
          <UserPlus size={12} /> Add crew in the Crew tab
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {crew.map((member) => {
        const isSelected = selected.includes(member.id)
        const roleColor = ROLE_COLORS[member.role]
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => toggle(member.id)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all"
            style={isSelected
              ? { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }
            }
          >
            {/* Checkbox */}
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all"
              style={isSelected
                ? { background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 0 8px rgba(14,165,233,0.4)' }
                : { border: '1px solid rgba(148,163,184,0.3)' }
              }
            >
              {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200">{member.name}</p>
              <p className="text-xs capitalize" style={{ color: roleColor }}>{member.role}</p>
            </div>

            {/* License badge */}
            {member.licenseNumber && (
              <span className="text-[0.6rem] font-mono text-slate-600 shrink-0">
                {member.licenseNumber}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
