'use client'

import { Card } from '@/components/ui/Card'
import { useHydrated } from '@/hooks/useHydrated'
import { useAuthStore } from '@/store/useAuthStore'

export default function SettingsPage() {
  const hydrated = useHydrated()
  const payload = useAuthStore((state) => state.payload)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">ตั้งค่า</h1>
      <Card title="บัญชีผู้ใช้">
        {hydrated && payload ? (
          <div className="text-sm flex flex-col gap-1">
            <span>ชื่อ: {payload.name}</span>
            <span>สิทธิ์: {payload.role}</span>
            <span>วอร์ด: {payload.wardId}</span>
          </div>
        ) : (
          <span className="text-sm text-base-content/60">
            ไม่พบข้อมูลผู้ใช้
          </span>
        )}
      </Card>
    </div>
  )
}
