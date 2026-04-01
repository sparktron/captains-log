import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Users, Trash2, X } from 'lucide-react'
import { useCrew } from '@/hooks/useLogs'
import { CrewMemberFormSchema, type CrewMemberForm } from '@/types'

const inputCls =
  'w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

const ROLE_LABELS: Record<CrewMemberForm['role'], string> = {
  captain: 'Captain',
  mate: 'Mate',
  crew: 'Crew',
  observer: 'Observer',
}

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
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-slate-800 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{initial ? 'Edit Crew Member' : 'Add Crew Member'}</h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-3" noValidate>
          <div>
            <input className={inputCls} placeholder="Full name *" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <select className={inputCls} {...register('role')}>
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <input
            className={inputCls}
            placeholder="USCG license # (optional)"
            {...register('licenseNumber')}
          />
          <input
            className={inputCls}
            placeholder="Notes (optional)"
            {...register('notes')}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white active:bg-sky-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Crew Member'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Crew() {
  const { crew, loading, addCrewMember, updateCrewMember, removeCrewMember } = useCrew()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const editMember = crew.find((c) => c.id === editId)

  const handleSave = async (data: CrewMemberForm) => {
    if (editId) {
      await updateCrewMember(editId, data)
    } else {
      await addCrewMember(data)
    }
    setShowModal(false)
    setEditId(null)
  }

  return (
    <div className="px-4 pt-6 pb-safe mb-nav max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Crew</h1>
        <button
          onClick={() => { setEditId(null); setShowModal(true) }}
          className="flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-sm font-medium text-white active:bg-sky-600"
        >
          <PlusCircle size={16} />
          Add
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />)}
        </div>
      ) : crew.length === 0 ? (
        <div className="rounded-xl bg-slate-800 p-8 text-center text-slate-400">
          <Users size={32} className="mx-auto mb-2 text-slate-600" />
          <p>No crew members added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {crew.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-sky-400">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{member.name}</p>
                <p className="text-xs text-slate-400 capitalize">
                  {ROLE_LABELS[member.role]}
                  {member.licenseNumber && ` · ${member.licenseNumber}`}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditId(member.id); setShowModal(true) }}
                  className="rounded-lg px-2 py-1.5 text-xs text-slate-400 active:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeCrewMember(member.id)}
                  className="rounded-lg p-1.5 text-red-400 active:bg-slate-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
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
