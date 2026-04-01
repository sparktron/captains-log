import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Users, Trash2, X, Clock } from 'lucide-react'
import { useCrew } from '@/hooks/useLogs'
import { Avatar } from '@/pages/Dashboard'
import { CrewMemberFormSchema, type CrewMemberForm } from '@/types'

const ROLE_LABELS: Record<CrewMemberForm['role'], string> = {
  captain: 'Captain',
  mate:    'Mate',
  crew:    'Crew',
  observer:'Observer',
}

const ROLE_COLORS: Record<CrewMemberForm['role'], string> = {
  captain: '#f59e0b',
  mate:    '#38bdf8',
  crew:    '#a3e635',
  observer:'#94a3b8',
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface CrewModalProps {
  initial?: CrewMemberForm
  onSave: (data: CrewMemberForm) => Promise<void>
  onClose: () => void
}

function CrewModal({ initial, onSave, onClose }: CrewModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrewMemberForm>({
    resolver: zodResolver(CrewMemberFormSchema),
    defaultValues: initial ?? { name: '', role: 'crew', licenseNumber: '', notes: '' },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}
      style={{ background: 'rgba(2,12,27,0.75)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full rounded-t-3xl p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #0d1f35 0%, #0a1628 100%)',
          border: '1px solid rgba(56,189,248,0.12)',
          borderBottom: 'none',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        }}
      >
        {/* Handle */}
        <div className="mx-auto w-10 h-1 rounded-full bg-slate-700 -mt-1 mb-4" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{initial ? 'Edit Crew Member' : 'Add Crew Member'}</h2>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-3" noValidate>
          <div>
            <input className="input" placeholder="Full name *" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-400">⚠ {errors.name.message}</p>}
          </div>

          <div>
            <select className="input" {...register('role')}>
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <input className="input" placeholder="USCG license # (optional)" {...register('licenseNumber')} />
          <input className="input" placeholder="Notes (optional)" {...register('notes')} />

          <button type="submit" disabled={isSubmitting} className="btn-primary !mt-5">
            {isSubmitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Crew Member'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Crew() {
  const { crew, crewHours, loading, addCrewMember, updateCrewMember, removeCrewMember } = useCrew()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const editMember = crew.find((c) => c.id === editId)

  const sorted = [...crew].sort((a, b) => {
    const diff = (crewHours[b.id] ?? 0) - (crewHours[a.id] ?? 0)
    return diff !== 0 ? diff : a.name.localeCompare(b.name)
  })

  const handleSave = async (data: CrewMemberForm) => {
    if (editId) await updateCrewMember(editId, data)
    else await addCrewMember(data)
    setShowModal(false)
    setEditId(null)
  }

  return (
    <div className="px-4 pt-5 pb-safe mb-nav max-w-lg mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', boxShadow: '0 2px 12px rgba(14,165,233,0.4)' }}>
            <Users size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Crew</h1>
            {!loading && crew.length > 0 && (
              <p className="text-[0.7rem] text-slate-500 mt-0.5">{crew.length} {crew.length === 1 ? 'member' : 'members'}</p>
            )}
          </div>
        </div>
        <button onClick={() => { setEditId(null); setShowModal(true) }} className="btn-pill">
          <PlusCircle size={14} />
          Add
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(13,31,53,0.6)' }} />)}
        </div>
      ) : crew.length === 0 ? (
        <div className="card p-10 text-center animate-slide-up">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
              <Users size={24} className="text-sky-400/60" />
            </div>
          </div>
          <p className="text-slate-300 font-semibold mb-1">No crew members yet</p>
          <p className="text-xs text-slate-600 mb-5">Add crew here, then select them on trips to track their hours</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 2px 10px rgba(14,165,233,0.3)' }}>
            <PlusCircle size={15} />
            Add first crew member
          </button>
        </div>
      ) : (
        <div className="space-y-2 animate-slide-up">
          {sorted.map((member, idx) => {
            const hours = crewHours[member.id] ?? 0
            const roleColor = ROLE_COLORS[member.role]
            const isTopCrew = hours > 0 && idx === 0

            return (
              <div key={member.id}
                className="card flex items-center gap-3.5 px-4 py-3.5"
                style={isTopCrew ? { borderColor: 'rgba(251,191,36,0.2)', boxShadow: '0 0 20px rgba(251,191,36,0.06)' } : {}}
              >
                <Avatar name={member.name} size="md" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-slate-100 truncate">{member.name}</p>
                    {isTopCrew && (
                      <span className="text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                        Top
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium" style={{ color: roleColor }}>
                      {ROLE_LABELS[member.role]}
                    </span>
                    {member.licenseNumber && (
                      <>
                        <span className="text-slate-700 text-xs">·</span>
                        <span className="text-xs font-mono text-slate-600">{member.licenseNumber}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Hours */}
                <div className="flex flex-col items-end shrink-0 mx-1">
                  <div className="flex items-center gap-1">
                    <Clock size={11} style={{ color: hours > 0 ? '#fbbf24' : '#475569' }} />
                    <span className={`text-sm font-bold tabular-nums ${hours > 0 ? '' : 'text-slate-600'}`}
                      style={hours > 0 ? { color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.3)' } : {}}>
                      {hours.toFixed(1)}h
                    </span>
                  </div>
                  <span className="text-[0.6rem] text-slate-600 mt-0.5">underway</span>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditId(member.id); setShowModal(true) }}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeCrewMember(member.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/70"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <CrewModal
          initial={editMember ? { name: editMember.name, role: editMember.role, licenseNumber: editMember.licenseNumber, notes: editMember.notes } : undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditId(null) }}
        />
      )}
    </div>
  )
}
