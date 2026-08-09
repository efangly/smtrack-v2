import type { ComponentType, SVGProps } from 'react'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accentClass = '',
  quiet = false,
  loading = false,
}: {
  label: string
  value: number | string
  hint?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** class ประจำหมวดจาก CATEGORY_ACCENT_CLASS (`@/lib/notificationType`) */
  accentClass?: string
  /** ยังไม่มีอะไรต้องสนใจ (count = 0 หรือโหลดไม่สำเร็จ) → สีหมวดจางลง */
  quiet?: boolean
  loading?: boolean
}) {
  return (
    <div
      data-accent={quiet ? 'quiet' : 'active'}
      className={`accent-bar surface-card surface-card-hover flex items-center gap-4 rounded-box p-4 pl-5 ${accentClass}`}
    >
      <span className="accent-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-base-content/60">{label}</p>
        {loading ? (
          <span className="skeleton mt-1 block h-7 w-12" />
        ) : (
          <p
            className={`text-2xl font-semibold tabular-nums ${quiet ? '' : 'accent-text'}`}
          >
            {value}
          </p>
        )}
        {hint && (
          <p className="truncate text-xs text-base-content/50">{hint}</p>
        )}
      </div>
    </div>
  )
}
