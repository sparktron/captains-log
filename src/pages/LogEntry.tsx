import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ArrowLeft, Trash2, CalendarDays, Anchor, MapPin, Navigation, Clock, Wind, Users, FileText, Ship } from 'lucide-react'
import { useLogs, useBoats, useCrew } from '@/hooks/useLogs'
import CrewPicker from '@/components/CrewPicker'
import { LogEntryFormSchema, type LogEntryForm } from '@/types'
import { getLog } from '@/db'

// ── Field wrappers ────────────────────────────────────────────────────────────

function FieldGroup({ icon, label, children, error }: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
        <span className="text-sky-500/70">{icon}</span>
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">⚠ {error}</p>}
    </div>
  )
}

// ── Section divider ───────────────────────────────────────────────────────────

function FormSection({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="divider flex-1" />
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-600">{title}</span>
      <div className="divider flex-1" />
    </div>
  )
}

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
      <div className="px-4 pt-5 pb-safe mb-nav max-w-lg mx-auto space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(13,31,53,0.6)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 pt-5 pb-safe mb-nav max-w-lg mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pt-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors"
          style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.12)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold tracking-tight flex-1">
          {isEdit ? 'Edit Trip' : 'New Trip'}
        </h1>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-red-400 transition-colors"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.12)' }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* ── When & Where ── */}
        <FormSection title="Voyage Details" />

        <FieldGroup icon={<CalendarDays size={12} />} label="Date" error={errors.date?.message}>
          <input type="date" className="input" {...register('date')} />
        </FieldGroup>

        <FieldGroup icon={<Ship size={12} />} label="Vessel" error={errors.boatId?.message}>
          <select className="input" {...register('boatId')}>
            <option value="">Select a vessel…</option>
            {boats.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {b.type}, {b.lengthFt}ft
              </option>
            ))}
          </select>
          {boats.length === 0 && (
            <p className="mt-1.5 text-xs text-slate-600 italic">Add vessels in the Boats tab first.</p>
          )}
        </FieldGroup>

        {/* Departure / Arrival */}
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup icon={<Anchor size={12} />} label="Departed" error={errors.departureLocation?.message}>
            <input className="input" placeholder="Marina, dock, anchorage…" {...register('departureLocation')} />
          </FieldGroup>
          <FieldGroup icon={<MapPin size={12} />} label="Arrived" error={errors.arrivalLocation?.message}>
            <input className="input" placeholder="Destination" {...register('arrivalLocation')} />
          </FieldGroup>
        </div>

        <FieldGroup icon={<Navigation size={12} />} label="Route sailed" error={errors.route?.message}>
          <textarea
            className="input min-h-[5rem] resize-none"
            placeholder="Describe the course taken…"
            {...register('route')}
          />
        </FieldGroup>

        {/* ── Time & Conditions ── */}
        <FormSection title="Time & Conditions" />

        <FieldGroup icon={<Clock size={12} />} label="Hours underway" error={errors.hoursUnderway?.message}>
          <input
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            className="input"
            placeholder="e.g. 4.5"
            {...register('hoursUnderway', { valueAsNumber: true })}
          />
        </FieldGroup>

        <FieldGroup icon={<Wind size={12} />} label="Conditions (optional)">
          <input
            className="input"
            placeholder="Sea state, visibility, wind speed & direction…"
            {...register('conditions')}
          />
        </FieldGroup>

        {/* ── Crew ── */}
        <FormSection title="Crew Aboard" />

        <FieldGroup icon={<Users size={12} />} label="Crew members">
          <div className="card-inset p-2">
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
        </FieldGroup>

        {/* ── Notes ── */}
        <FormSection title="Notes" />

        <FieldGroup icon={<FileText size={12} />} label="Additional remarks">
          <textarea
            className="input min-h-[4rem] resize-none"
            placeholder="Any additional remarks…"
            {...register('notes')}
          />
        </FieldGroup>

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
          {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Log Trip'}
        </button>
      </form>
    </div>
  )
}
