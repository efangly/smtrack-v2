'use client'

import { Badge } from '@/components/ui/Badge'
import { useAuthHealth } from '@/hooks/useAuthHealth'

export function AuthServiceStatusCard() {
  const { data, isLoading, isError } = useAuthHealth()

  if (isLoading) return <span className="loading loading-spinner loading-md" />

  return (
    <div className="flex items-center gap-2 text-sm">
      {isError ? (
        <>
          <Badge tone="error">ไม่พร้อมใช้งาน</Badge>
          <span className="text-base-content/60">
            ติดต่อบริการยืนยันตัวตนไม่ได้
          </span>
        </>
      ) : (
        <>
          <Badge tone="success">พร้อมใช้งาน</Badge>
          <span className="text-base-content/60">
            สถานะที่รายงาน: {data?.status ?? 'ok'}
          </span>
        </>
      )}
    </div>
  )
}
