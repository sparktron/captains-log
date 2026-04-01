import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useLogs, useBoats, useCrew } from '@/hooks/useLogs'
import CrewPicker from '@/components/CrewPicker'
import { LogEntryFormSchema, type LogEntryForm } from '@/types'
import { getLog } from '@/db'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-300 mb-1">{children}</label>
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-400">{message}</p>
}

const inputCls =
  'w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

export default function LogEntryPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { addLog, updateLog, removeLog } = useLogs()
  const { boats } = useBoats()
  const { crew } = useCrew()
  const [loading, setLoading] = useState(isEdit)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogEntryForm>({
    resolver: zodResolver(LogEntryFormSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      crewIds: [],
      conditions: '',
      notes: '',
    },
  })

  // Load existing entry for edit mode
  useEffect(() => {
    if (!id) return
    getLog(id).then((entry) => {
      if (entry) {
        const { id: _id, createdAt: _ts, ...form } = entry
        reset(form)
      }
      setLoading(false)
    })
  }, [id, reset])

  const onSubmit = async (data: LogEntryForm) => {
    if (isEdit && id) {
      await updateLog(id, data)
    } else {
      await addLog(data)
    }
    navigate('/log')
  }

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('Delete this log entry?')) return
    await removeLog(id)
    navigate('/log')
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-safe mb-nav max-w-lg mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-safe mb-nav max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full p-1.5 text-slate-400 active:bg-slate-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">{isEdit ? 'Edit Trip' : 'New Trip'}</h1>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto rounded-full p-1.5 text-red-400 active:bg-slate-700"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Date */}
        <div>
          <FieldLabel>Date</FieldLabel>
          <input type="date" className={inputCls} {...register('date')} />
          <FieldError message={errors.date?.message} />
        </div>

        {/* Boat */}
        <div>
          <FieldLabel>Vessel</FieldLabel>
          <select className={inputCls} {...register('boatId')}>
            <option value="">Select a boat…</option>
            {boats.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.type})
              </option>
            ))}
          </select>
          <FieldError message={errors.boatId?.message} />
          {boats.length === 0 && (
            <p className="mt-1 text-xs text-slate-500">
              Add boats in the Boats tab first.
            </p>
          )}
        </div>

        {/* Departure / Arrival */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Departed</FieldLabel>
            <input
              className={inputCls}
              placeholder="Marina, dock, anchorage…"
              {...register('departureLocation')}
            />
            <FieldError message={errors.departureLocation?.message} />
          </div>
          <div>
            <FieldLabel>Arrived</FieldLabel>
            <input
              className={inputCls}
              placeholder="Destination"
              {...register('arrivalLocation')}
            />
            <FieldError message={errors.arrivalLocation?.message} />
          </div>
        </div>

        {/* Route */}
        <div>
          <FieldLabel>Route sailed</FieldLabel>
          <textarea
            className={`${inputCls} min-h-[5rem] resize-none`}
            placeholder="Describe the course taken…"
            {...register('route')}
          />
          <FieldError message={errors.route?.message} />
        </div>

        {/* Hours underway */}
        <div>
          <FieldLabel>Hours underway</FieldLabel>
          <input
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            className={inputCls}
            placeholder="e.g. 4.5"
            {...register('hoursUnderway', { valueAsNumber: true })}
          />
          <FieldError message={errors.hoursUnderway?.message} />
        </div>

        {/* Conditions */}
        <div>
          <FieldLabel>Conditions (optional)</FieldLabel>
          <input
            className={inputCls}
            placeholder="Sea state, visibility, wind…"
            {...register('conditions')}
          />
        </div>

        {/* Crew */}
        <div>
          <FieldLabel>Crew aboard</FieldLabel>
          <Controller
            control={control}
            name="crewIds"
            render={({ field }) => (
              <CrewPicker
                crew={crew}
                selected={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Notes */}
        <div>
          <FieldLabel>Notes (optional)</FieldLabel>
          <textarea
            className={`${inputCls} min-h-[4rem] resize-none`}
            placeholder="Any additional remarks…"
            {...register('notes')}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white active:bg-sky-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Log Trip'}
        </button>
      </form>
    </div>
  )
}
