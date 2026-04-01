/**
 * Bottom-sheet that guides the user through a JSON log import.
 *
 * States:
 *   idle      → file picker button
 *   preview   → shows what will be imported, awaits confirm
 *   importing → spinner
 *   done      → success / error summary
 */
import { useRef, useState } from 'react'
import { Upload, FileJson, CheckCircle2, AlertTriangle, X, Ship, Users, BookOpen } from 'lucide-react'
import { parseImportJson, importLogFile, ImportFileSchema } from '@/utils/importLogs'
import type { ImportResult } from '@/utils/importLogs'

type SheetState = 'idle' | 'preview' | 'importing' | 'done'

interface PreviewInfo {
  entryCount: number
  boatNames: string[]
  crewNames: string[]
  raw: unknown
}

interface Props {
  onClose: () => void
  onImported: () => void
}

export default function ImportSheet({ onClose, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<SheetState>('idle')
  const [preview, setPreview] = useState<PreviewInfo | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // ── File selected ──────────────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = parseImportJson(ev.target?.result as string)
        const parsed = ImportFileSchema.safeParse(raw)
        if (!parsed.success) {
          const msgs = parsed.error.errors.map((err) => err.message).join(' · ')
          setFileError(msgs)
          return
        }

        // Collect unique boat/crew names for the preview
        const boatSet = new Set<string>()
        const crewSet = new Set<string>()
        for (const entry of parsed.data.entries) {
          boatSet.add(entry.vessel.name)
          entry.crew.forEach((c) => crewSet.add(c.name))
        }

        setPreview({
          entryCount: parsed.data.entries.length,
          boatNames: [...boatSet],
          crewNames: [...crewSet],
          raw,
        })
        setState('preview')
      } catch (err) {
        setFileError(err instanceof Error ? err.message : 'Could not read file')
      }
    }
    reader.readAsText(file)
    // Reset so the same file can be re-selected after an error
    e.target.value = ''
  }

  // ── Confirm import ─────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!preview) return
    setState('importing')
    try {
      const res = await importLogFile(preview.raw)
      setResult(res)
      setState('done')
      if (res.imported > 0) onImported()
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Import failed')
      setState('idle')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
      style={{ background: 'rgba(2,12,27,0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg mx-auto rounded-t-3xl p-5 animate-slide-up"
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

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 2px 10px rgba(139,92,246,0.4)' }}>
              <Upload size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-lg">Import Log Data</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── IDLE: file picker ── */}
        {state === 'idle' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Select a <span className="text-slate-200 font-medium">.json</span> file formatted
              according to the Captain's Log import schema. New vessels and crew members will be
              created automatically; duplicate entries (same date + route) are skipped.
            </p>

            {fileError && (
              <div className="flex gap-2.5 rounded-xl p-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle size={16} className="shrink-0 text-red-400 mt-0.5" />
                <p className="text-sm text-red-300">{fileError}</p>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFile}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                boxShadow: '0 2px 12px rgba(139,92,246,0.4)',
                color: 'white',
              }}
            >
              <FileJson size={16} />
              Choose JSON File
            </button>
          </div>
        )}

        {/* ── PREVIEW: what will be imported ── */}
        {state === 'preview' && preview && (
          <div className="space-y-4">
            {/* Summary chip */}
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <BookOpen size={18} className="text-violet-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-100">
                  {preview.entryCount} trip {preview.entryCount === 1 ? 'entry' : 'entries'} ready to import
                </p>
                <p className="text-xs text-slate-500">Duplicates will be skipped automatically</p>
              </div>
            </div>

            {/* Vessels */}
            {preview.boatNames.length > 0 && (
              <PreviewGroup icon={<Ship size={13} />} label="Vessels in file" color="#38bdf8" items={preview.boatNames} />
            )}

            {/* Crew */}
            {preview.crewNames.length > 0 && (
              <PreviewGroup icon={<Users size={13} />} label="Crew members in file" color="#a78bfa" items={preview.crewNames} />
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              Vessels and crew not already in your app will be created. Existing records with
              matching names will be reused — no duplicates.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setState('idle'); setPreview(null) }}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-slate-400"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-2 rounded-xl py-3 px-6 text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  boxShadow: '0 2px 12px rgba(139,92,246,0.4)',
                  flex: 2,
                }}
              >
                Import {preview.entryCount} {preview.entryCount === 1 ? 'Entry' : 'Entries'}
              </button>
            </div>
          </div>
        )}

        {/* ── IMPORTING: spinner ── */}
        {state === 'importing' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="h-12 w-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            <p className="text-sm text-slate-400">Importing entries…</p>
          </div>
        )}

        {/* ── DONE: results ── */}
        {state === 'done' && result && (
          <div className="space-y-4">
            {/* Main result */}
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={
                result.imported > 0
                  ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }
                  : { background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)' }
              }>
              <CheckCircle2 size={20} className={result.imported > 0 ? 'text-emerald-400 shrink-0' : 'text-slate-500 shrink-0'} />
              <div>
                <p className="font-semibold text-slate-100">
                  {result.imported > 0
                    ? `${result.imported} ${result.imported === 1 ? 'entry' : 'entries'} imported successfully`
                    : 'Nothing new to import'}
                </p>
                {result.skipped > 0 && (
                  <p className="text-xs text-slate-500">{result.skipped} duplicate {result.skipped === 1 ? 'entry' : 'entries'} skipped</p>
                )}
              </div>
            </div>

            {/* New records created */}
            {(result.newBoats.length > 0 || result.newCrew.length > 0) && (
              <div className="space-y-2">
                {result.newBoats.length > 0 && (
                  <PreviewGroup icon={<Ship size={13} />} label="New vessels added" color="#38bdf8" items={result.newBoats} />
                )}
                {result.newCrew.length > 0 && (
                  <PreviewGroup icon={<Users size={13} />} label="New crew members added" color="#a78bfa" items={result.newCrew} />
                )}
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="rounded-xl p-3 space-y-1"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-xs font-semibold text-red-400 mb-2">
                  {result.errors.length} {result.errors.length === 1 ? 'entry' : 'entries'} had errors:
                </p>
                {result.errors.map((err) => (
                  <p key={err.index} className="text-xs text-red-300">
                    Entry {err.index}{err.date ? ` (${err.date})` : ''}: {err.message}
                  </p>
                ))}
              </div>
            )}

            <button onClick={onClose} className="btn-primary">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helper sub-component ──────────────────────────────────────────────────────

function PreviewGroup({
  icon, label, color, items,
}: {
  icon: React.ReactNode
  label: string
  color: string
  items: string[]
}) {
  return (
    <div className="card-inset p-3 space-y-1.5">
      <div className="flex items-center gap-1.5 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      {items.map((name) => (
        <p key={name} className="text-sm text-slate-300 pl-1">{name}</p>
      ))}
    </div>
  )
}
