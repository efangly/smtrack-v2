'use client'

import { useQuery } from '@tanstack/react-query'

import { getDevices } from '@/lib/api/devices'

export function useDevices(params: { search?: string } = {}) {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: () => getDevices(params),
    // สถานะ online/offline อัปเดตแบบเรียลไทม์ผ่าน RealtimeFeedProvider (SSE) แล้ว
    // ตัวนี้เหลือไว้เป็น fallback เผื่อ SSE connection หลุด/reconnect ไม่ทัน
    refetchInterval: 120_000,
  })
}
