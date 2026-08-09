'use client'

import { useQuery } from '@tanstack/react-query'

import { getAllTelemetry, type QueryTelemetryParams } from '@/lib/api/telemetry'

export function useTelemetry(params: QueryTelemetryParams) {
  const customIncomplete = params.range === 'custom' && (!params.from || !params.to)
  return useQuery({
    queryKey: ['telemetry', params],
    // ใช้ getAllTelemetry (paginate จนครบ) แทน getTelemetry หน้าเดียว — ผู้ใช้เลือก
    // range แล้วต้องเห็นข้อมูลครบทั้งช่วง ไม่ใช่แค่ default limit ของ backend
    queryFn: () => getAllTelemetry(params),
    enabled: !!params.serial && !customIncomplete,
  })
}
