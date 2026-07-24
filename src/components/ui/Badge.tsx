import type { ReactNode } from 'react'

type BadgeTone = 'success' | 'error' | 'warning' | 'neutral' | 'info'

const TONE_CLASS: Record<BadgeTone, string> = {
  success: 'badge-success',
  error: 'badge-error',
  warning: 'badge-warning',
  neutral: 'badge-neutral',
  info: 'badge-info',
}

export function Badge({
  tone,
  children,
}: {
  tone: BadgeTone
  children: ReactNode
}) {
  return <span className={`badge ${TONE_CLASS[tone]}`}>{children}</span>
}
