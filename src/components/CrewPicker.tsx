import { Check } from 'lucide-react'
import type { CrewMember } from '@/types'

interface Props {
  crew: CrewMember[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export default function CrewPicker({ crew, selected, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    )
  }

  if (crew.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-2">
        No crew members added yet. Add them in the Crew tab.
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      {crew.map((member) => {
        const isSelected = selected.includes(member.id)
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => toggle(member.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
              isSelected
                ? 'bg-sky-900/50 border border-sky-600'
                : 'bg-slate-700 border border-transparent active:bg-slate-600'
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-500'
              }`}
            >
              {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-xs text-slate-400 capitalize">{member.role}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
