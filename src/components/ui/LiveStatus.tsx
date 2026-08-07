import type { SseStatus } from '@/hooks/useSse'

const STATUS_LABEL: Record<SseStatus, string> = {
  connecting: 'กำลังเชื่อมต่อ...',
  open: 'เชื่อมต่อสด',
  error: 'ขาดการเชื่อมต่อ',
  reconnecting: 'กำลังเชื่อมต่อใหม่...',
}

const STATUS_TONE: Record<SseStatus, string> = {
  connecting: 'text-warning',
  open: 'text-success',
  error: 'text-error',
  reconnecting: 'text-warning',
}

/** จุดสถานะ + ป้ายข้อความของ SSE stream ใช้ร่วมกันทุกที่ที่มี live feed */
export function LiveStatus({
  status,
  showLabel = true,
}: {
  status: SseStatus
  showLabel?: boolean
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-base-content/60"
      title={STATUS_LABEL[status]}
    >
      <span
        className={`status-dot ${STATUS_TONE[status]} ${
          status === 'open' ? 'status-dot-live' : ''
        }`}
      />
      {showLabel && STATUS_LABEL[status]}
      {!showLabel && <span className="sr-only">{STATUS_LABEL[status]}</span>}
    </span>
  )
}
