import type { LucideIcon } from 'lucide-react'

type StatTone = 'neutral' | 'success' | 'error' | 'warning'

const TONE_CLASS: Record<StatTone, string> = {
  neutral: 'bg-base-200 text-base-content/70',
  success: 'bg-success/15 text-success',
  error: 'bg-error/15 text-error',
  warning: 'bg-warning/15 text-warning',
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'neutral',
  loading = false,
}: {
  label: string
  value: number | string
  hint?: string
  icon: LucideIcon
  tone?: StatTone
  loading?: boolean
}) {
  return (
    <div className="flex items-center gap-4 rounded-box surface-card p-4">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONE_CLASS[tone]}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-base-content/60">{label}</p>
        {loading ? (
          <span className="skeleton mt-1 block h-7 w-12" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
        )}
        {hint && (
          <p className="truncate text-xs text-base-content/50">{hint}</p>
        )}
      </div>
    </div>
  )
}
