export function DeviceStatusBadge({
  online,
  variant = 'dot',
}: {
  online: boolean
  variant?: 'dot' | 'pill'
}) {
  const label = online ? 'ออนไลน์' : 'ออฟไลน์'

  if (variant === 'pill') {
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          online ? 'bg-success text-success-content' : 'bg-error text-error-content'
        }`}
      >
        {label}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center" title={label}>
      <span
        className={`status-dot ${online ? 'status-dot-live text-success' : 'text-error'}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
