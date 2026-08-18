'use client'

import { useQuery } from '@tanstack/react-query'

import { getTelemetry } from '@/lib/api/telemetry'

// กรองด้วย deviceId (จุดติดตั้ง) แทน serial (กล่องฮาร์ดแวร์) — ค่าล่าสุดต้องต่อเนื่อง
// ข้ามการสลับเครื่อง ไม่ใช่รีเซ็ตทุกครั้งที่เปลี่ยนกล่อง
export function useLatestTelemetry(deviceId: string | null) {
  return useQuery({
    queryKey: ['telemetry', { deviceId, limit: 1 }],
    queryFn: () => getTelemetry({ deviceId: deviceId as string, limit: 1 }),
    enabled: !!deviceId,
    refetchInterval: 20_000,
    select: (data) => data[0],
  })
}
