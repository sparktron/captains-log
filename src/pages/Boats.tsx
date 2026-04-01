import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Ship, Trash2, X, Ruler, Hash } from 'lucide-react'
import { useBoats } from '@/hooks/useLogs'
import { BoatFormSchema, type BoatForm } from '@/types'

const VESSEL_TYPES = ['Sailboat', 'Powerboat', 'Trawler', 'Catamaran', 'Motorsailer', 'Other']

// Gradient per vessel type index
const BOAT_GRADIENTS = [
  ['#0ea5e9', '#0369a1'],
  ['#8b5cf6', '#6d28d9'],
  ['#10b981', '#047857'],
  ['#f59e0b', '#b45309'],
  ['#ec4899', '#be185d'],
  ['#64748b', '#334155'],
]

function boatGradient(name: string) {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % BOAT_GRADIENTS.length
  return BOAT_GRADIENTS[idx]
}

// ── Modal ────────────────────────────────────────────────────────────────────

interface BoatModalProps {
  initial?: BoatForm
  onSave: (data: BoatForm) => Promise<void>
  onClose: () => void
}

function BoatModal({ initial, onSave, onClose }: BoatModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BoatForm>({
    resolver: zodResolver(BoatFormSchema),
    defaultValues: initial ?? { name: '', type: '', lengthFt: undefined as unknown as number, documentationNumber: '' },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}
      style={{ background: 'rgba(2,12,27,0.75)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full rounded-t-3xl p-5 space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #0d1f35 0%, #0a1628 100%)',
          border: '1px solid rgba(56,189,248,0.12)',
          borderBottom: 'none',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        }}
      >
        {/* Handle */}
        <div className="mx-auto w-10 h-1 rounded-full bg-slate-700 -mt-1 mb-3" />

        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{initial ? 'Edit Vessel' : 'Add Vessel'}</h2>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-3" noValidate>
          <div>
            <input className="input" placeholder="Vessel name *" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-400">⚠ {errors.name.message}</p>}
          </div>

          <div>
            <select className="input" {...register('type')}>
              <option value="">Vessel type *</option>
              {VESSEL_TYPES.map((t) => <option key={t} value={t.toLowerCase()}>{t}</option>)}
            </select>
            {errors.type && <p className="mt-1 text-xs text-red-400">⚠ {errors.type.message}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                type="number" step="1" min="1"
                className="input pr-10"
                placeholder="Length (ft) *"
                {...register('lengthFt', { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">ft</span>
            </div>
            {errors.lengthFt && <p className="mt-1 text-xs text-red-400">⚠ {errors.lengthFt.message}</p>}
          </div>

          <input
            className="input"
            placeholder="USCG doc # or state reg # (optional)"
            {...register('documentationNumber')}
          />

          <button type="submit" disabled={isSubmitting} className="btn-primary !mt-5">
            {isSubmitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Vessel'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Boats() {
  const { boats, loading, addBoat, updateBoat, removeBoat } = useBoats()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const editBoat = boats.find((b) => b.id === editId)

  const handleSave = async (data: BoatForm) => {
    if (editId) await updateBoat(editId, data)
    else await addBoat(data)
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
            <Ship size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Vessels</h1>
            {!loading && boats.length > 0 && (
              <p className="text-[0.7rem] text-slate-500 mt-0.5">{boats.length} {boats.length === 1 ? 'vessel' : 'vessels'}</p>
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
          {[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(13,31,53,0.6)' }} />)}
        </div>
      ) : boats.length === 0 ? (
        <div className="card p-10 text-center animate-slide-up">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
              <Ship size={24} className="text-sky-400/60" />
            </div>
          </div>
          <p className="text-slate-300 font-semibold mb-1">No vessels yet</p>
          <p className="text-xs text-slate-600 mb-5">Add your boat before logging trips</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 2px 10px rgba(14,165,233,0.3)' }}>
            <PlusCircle size={15} />
            Add your first vessel
          </button>
        </div>
      ) : (
        <div className="space-y-2 animate-slide-up">
          {boats.map((boat) => {
            const [from, to] = boatGradient(boat.name)
            return (
              <div key={boat.id} className="card flex items-center gap-4 px-4 py-4">
                {/* Vessel icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 2px 10px ${from}55` }}>
                  <Ship size={20} className="text-white" strokeWidth={2} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">{boat.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Ruler size={10} /> {boat.lengthFt}ft
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="text-xs text-slate-500 capitalize">{boat.type}</span>
                    {boat.documentationNumber && (
                      <>
                        <span className="text-slate-700">·</span>
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Hash size={9} />{boat.documentationNumber}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditId(boat.id); setShowModal(true) }}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeBoat(boat.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/70 transition-colors"
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
        <BoatModal
          initial={editBoat ? { name: editBoat.name, type: editBoat.type, lengthFt: editBoat.lengthFt, documentationNumber: editBoat.documentationNumber } : undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditId(null) }}
        />
      )}
    </div>
  )
}
