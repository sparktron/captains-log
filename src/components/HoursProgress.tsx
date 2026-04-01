import { LICENSE_REQUIREMENTS, type LicenseType } from '@/types'

interface Props {
  totalHours: number
  licenseType?: LicenseType
}

const LABEL: Record<LicenseType, string> = {
  OUPV: 'OUPV / 6-Pack',
  MASTER_25: 'Master ≤25 GT',
  MASTER_50: 'Master ≤50 GT',
}

export default function HoursProgress({ totalHours, licenseType = 'OUPV' }: Props) {
  const required = LICENSE_REQUIREMENTS[licenseType]
  const pct = Math.min((totalHours / required) * 100, 100)

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{LABEL[licenseType]}</span>
        <span className="font-medium tabular-nums">
          {totalHours.toFixed(1)} / {required} hrs
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={totalHours}
          aria-valuemin={0}
          aria-valuemax={required}
        />
      </div>
      <p className="text-xs text-slate-500 text-right">
        {pct >= 100
          ? 'Requirement met!'
          : `${(required - totalHours).toFixed(1)} hrs remaining`}
      </p>
    </div>
  )
}
