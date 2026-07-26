'use client'

import { Badge } from '@/components/ui/Badge'
import { useHydrated } from '@/hooks/useHydrated'
import { useUser } from '@/hooks/useUser'
import { useAuthStore } from '@/store/useAuthStore'
import { ROLE_LABELS } from '@/types/auth'

export function AccountCard() {
  const hydrated = useHydrated()
  const payload = useAuthStore((state) => state.payload)
  // JWT มีแต่ id/ward id — ดึงรายละเอียดจริง (ชื่อวอร์ด, โรงพยาบาล) จาก GET /user/:id
  // ซึ่ง preload ward.hospital มาให้ด้วย
  const { data: user } = useUser(hydrated ? (payload?.id ?? '') : '')

  if (!hydrated || !payload) {
    return (
      <span className="text-sm text-base-content/60">ไม่พบข้อมูลผู้ใช้</span>
    )
  }

  const rows: { label: string; value: string }[] = [
    { label: 'ชื่อผู้ใช้', value: user?.username ?? '-' },
    { label: 'ชื่อที่แสดง', value: user?.display ?? payload.name },
    { label: 'วอร์ด', value: user?.ward?.wardName ?? payload.wardId },
    {
      label: 'โรงพยาบาล',
      value: user?.ward?.hospital?.hosName ?? payload.hosId,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-base-content/60">{row.label}</dt>
            <dd className="font-medium break-words">{row.value}</dd>
          </div>
        ))}
        <div>
          <dt className="text-xs text-base-content/60">สิทธิ์</dt>
          <dd className="mt-0.5">
            <Badge tone="info">{ROLE_LABELS[payload.role]}</Badge>
          </dd>
        </div>
      </dl>
    </div>
  )
}
