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
  // ความสูงคงที่ของ .badge (daisyUI) แคบเกินไปสำหรับสระ/วรรณยุกต์ไทยที่ลอยสูง เช่น
  // ่ ้ ๊ ๋ ์ (โดยเฉพาะ "ออนไลน์"/"ออฟไลน์") ทำให้ดูเหมือนตัวอักษรถูกตัด —
  // ปลด height คงที่ออกแล้วเผื่อ padding แนวตั้งให้พอแทน
  return (
    <span
      className={`badge badge-sm h-auto whitespace-nowrap px-2 py-0.5 leading-normal ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  )
}
