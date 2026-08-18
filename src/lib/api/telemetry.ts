import { z } from 'zod'

import { apiClient, type EnvelopeResponse } from '@/lib/apiClient'

export const LogDaySchema = z.object({
  id: z.string(),
  serial: z.string(),
  temp: z.number(),
  tempDisplay: z.number(),
  humidity: z.number(),
  humidityDisplay: z.number(),
  sendTime: z.string(),
  plug: z.boolean(),
  door1: z.boolean(),
  door2: z.boolean(),
  door3: z.boolean(),
  internet: z.boolean(),
  probe: z.string(),
  probeId: z.string(),
  battery: z.number(),
  tempInternal: z.number().nullable(),
  extMemory: z.boolean(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type LogDay = z.infer<typeof LogDaySchema>

export type TelemetryRange = '1d' | '7d' | '30d' | 'custom'

export interface QueryTelemetryParams {
  // กรองด้วยกล่องฮาร์ดแวร์เท่านั้น — ได้เฉพาะ log ที่กล่องนั้นยิงมา ไม่ต่อเนื่องข้ามการสลับเครื่อง
  // ใช้ deviceId แทนเมื่อรู้จุดติดตั้ง (ดู DeviceTelemetrySection)
  serial?: string
  // กรองด้วยจุดติดตั้ง — ได้ประวัติต่อเนื่องข้ามการสลับเครื่อง (ตรงกับ backend QueryTelemetryDto.deviceId)
  deviceId?: string
  probeId?: string
  range?: TelemetryRange
  from?: string
  to?: string
  limit?: number
}

export async function getTelemetry(
  params: QueryTelemetryParams,
): Promise<LogDay[]> {
  const { data } = await apiClient.get('/telemetry', { params })
  return z.array(LogDaySchema).parse(data)
}

const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

// backend (QueryTelemetryDto) จำกัด limit ต่อหน้าไว้ที่ 1000 แถว — ดึงทีละหน้าใหญ่สุด
// เพื่อลดจำนวน request ที่ต้องยิง
const PAGE_LIMIT = 1000
// กันไม่ให้ custom range ที่กว้างเกินไป (เช่นเลือกช่วงหลายปี) ยิง request รัวเป็นสิบๆ
// ครั้งจนกระทบ TimescaleDB — ตัดที่ 20 หน้า (สูงสุด 20,000 แถว) พอสำหรับใช้งานจริง
const MAX_PAGES = 20

/**
 * ดึง telemetry "ทั้งช่วงเวลา" ที่เลือก ไม่ใช่แค่หน้าแรก — ใช้กับกราฟ/ตารางที่ต้องเห็น
 * ข้อมูลครบตาม range (1d/7d/30d/custom) เดินหน้าทีละหน้าจนครบ totalPages เพื่อไม่ยิง
 * request จำนวนมากพร้อมกันใส่ TimescaleDB
 */
export async function getAllTelemetry(
  params: QueryTelemetryParams,
): Promise<LogDay[]> {
  const first: EnvelopeResponse = await apiClient.get('/telemetry', {
    params: { ...params, page: 1, limit: PAGE_LIMIT },
  })
  const meta = PaginationMetaSchema.parse(first.meta)
  const rows = z.array(LogDaySchema).parse(first.data)

  const pageCount = Math.min(meta.totalPages, MAX_PAGES)
  for (let page = 2; page <= pageCount; page++) {
    const res: EnvelopeResponse = await apiClient.get('/telemetry', {
      params: { ...params, page, limit: PAGE_LIMIT },
    })
    rows.push(...z.array(LogDaySchema).parse(res.data))
  }

  return rows
}
