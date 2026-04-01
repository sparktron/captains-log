import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Ship, Trash2, X } from 'lucide-react'
import { useBoats } from '@/hooks/useLogs'
import { BoatFormSchema, type BoatForm } from '@/types'

const inputCls =
  'w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

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
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-slate-800 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{initial ? 'Edit Boat' : 'Add Boat'}</h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-3" noValidate>
          <div>
            <input className={inputCls} placeholder="Boat name *" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <input className={inputCls} placeholder="Vessel type (e.g. sailboat) *" {...register('type')} />
            {errors.type && <p className="mt-1 text-xs text-red-400">{errors.type.message}</p>}
          </div>
          <div>
            <input
              type="number"
              step="1"
              min="1"
              className={inputCls}
              placeholder="Length (ft) *"
              {...register('lengthFt', { valueAsNumber: true })}
            />
            {errors.lengthFt && <p className="mt-1 text-xs text-red-400">{errors.lengthFt.message}</p>}
          </div>
          <input
            className={inputCls}
            placeholder="USCG doc # / state reg # (optional)"
            {...register('documentationNumber')}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white active:bg-sky-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Boat'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Boats() {
  const { boats, loading, addBoat, updateBoat, removeBoat } = useBoats()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const editBoat = boats.find((b) => b.id === editId)

  const handleSave = async (data: BoatForm) => {
    if (editId) {
      await updateBoat(editId, data)
    } else {
      await addBoat(data)
    }
    setShowModal(false)
    setEditId(null)
  }

  return (
    <div className="px-4 pt-6 pb-safe mb-nav max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Boats</h1>
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
      ) : boats.length === 0 ? (
        <div className="rounded-xl bg-slate-800 p-8 text-center text-slate-400">
          <Ship size={32} className="mx-auto mb-2 text-slate-600" />
          <p>No boats added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {boats.map((boat) => (
            <div
              key={boat.id}
              className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3"
            >
              <Ship size={18} className="shrink-0 text-sky-400" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{boat.name}</p>
                <p className="text-xs text-slate-400">
                  {boat.type} · {boat.lengthFt}ft
                  {boat.documentationNumber && ` · ${boat.documentationNumber}`}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditId(boat.id); setShowModal(true) }}
                  className="rounded-lg px-2 py-1.5 text-xs text-slate-400 active:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeBoat(boat.id)}
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
        <BoatModal
          initial={editBoat ? { name: editBoat.name, type: editBoat.type, lengthFt: editBoat.lengthFt, documentationNumber: editBoat.documentationNumber } : undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditId(null) }}
        />
      )}
    </div>
  )
}
