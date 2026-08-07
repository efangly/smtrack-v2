import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'
import type { PaginationQuery } from '@/lib/api/pagination'

export const DaySchema = z.enum([
  'OFF',
  'ALL',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
])
export type Day = z.infer<typeof DaySchema>

export const ProbeSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  name: z.string().nullable(),
  type: z.string().nullable(),
  channel: z.string().nullable(),
  tempMin: z.number().nullable(),
  tempMax: z.number().nullable(),
  humiMin: z.number().nullable(),
  humiMax: z.number().nullable(),
  tempAdj: z.number().nullable(),
  humiAdj: z.number().nullable(),
  stampTime: z.string().nullable(),
  doorQty: z.number().nullable(),
  position: z.string().nullable(),
  muteAlarmDuration: z.string().nullable(),
  doorSound: z.boolean().nullable(),
  doorAlarmTime: z.string().nullable(),
  muteDoorAlarmDuration: z.string().nullable(),
  notiDelay: z.number().nullable(),
  notiToNormal: z.boolean().nullable(),
  notiMobile: z.boolean().nullable(),
  notiRepeat: z.number().nullable(),
  firstDay: DaySchema.nullable(),
  secondDay: DaySchema.nullable(),
  thirdDay: DaySchema.nullable(),
  firstTime: z.string().nullable(),
  secondTime: z.string().nullable(),
  thirdTime: z.string().nullable(),
})
export type Probe = z.infer<typeof ProbeSchema>

export const ProbeInputSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  channel: z.string().optional(),
  tempMin: z.number().optional(),
  tempMax: z.number().optional(),
  humiMin: z.number().optional(),
  humiMax: z.number().optional(),
  tempAdj: z.number().optional(),
  humiAdj: z.number().optional(),
  stampTime: z.string().optional(),
  doorQty: z.number().optional(),
  position: z.string().optional(),
  muteAlarmDuration: z.string().optional(),
  doorSound: z.boolean().optional(),
  doorAlarmTime: z.string().optional(),
  muteDoorAlarmDuration: z.string().optional(),
  notiDelay: z.number().optional(),
  notiToNormal: z.boolean().optional(),
  notiMobile: z.boolean().optional(),
  notiRepeat: z.number().optional(),
  firstDay: DaySchema.optional(),
  secondDay: DaySchema.optional(),
  thirdDay: DaySchema.optional(),
  firstTime: z.string().optional(),
  secondTime: z.string().optional(),
  thirdTime: z.string().optional(),
})
export type ProbeInput = z.infer<typeof ProbeInputSchema>

export async function getProbes(
  deviceId: string,
  params: PaginationQuery = {},
): Promise<Probe[]> {
  const { data } = await apiClient.get(
    `/devices/${encodeURIComponent(deviceId)}/probes`,
    { params },
  )
  return z.array(ProbeSchema).parse(data)
}

// ค่า telemetry ล่าสุด "ต่อ probe" (อุณหภูมิ/ความชื้น/ประตู) ต่างจาก ProbeSchema
// ด้านบนที่เป็นแค่ config (doorQty/channel/...) — มาจาก GET .../probes/telemetry
// ที่ join กับ LogDays ล่าสุดต่อ probeId ให้แล้วฝั่ง backend
export const ProbeTelemetrySchema = z.object({
  id: z.string(),
  channel: z.string(),
  name: z.string().nullable(),
  type: z.string().nullable(),
  doorQty: z.number(),
  temp: z.number().nullable(),
  tempDisplay: z.number().nullable(),
  humidity: z.number().nullable(),
  humidityDisplay: z.number().nullable(),
  door1: z.boolean().nullable(),
  door2: z.boolean().nullable(),
  door3: z.boolean().nullable(),
  sendTime: z.string().nullable(),
})
export type ProbeTelemetry = z.infer<typeof ProbeTelemetrySchema>

export async function getDeviceProbeTelemetry(
  deviceId: string,
): Promise<ProbeTelemetry[]> {
  const { data } = await apiClient.get(
    `/devices/${encodeURIComponent(deviceId)}/probes/telemetry`,
  )
  return z.array(ProbeTelemetrySchema).parse(data)
}

export async function getProbe(id: string): Promise<Probe> {
  const { data } = await apiClient.get(`/probes/${encodeURIComponent(id)}`)
  return ProbeSchema.parse(data)
}

export async function createProbe(
  deviceId: string,
  dto: ProbeInput,
): Promise<Probe> {
  const { data } = await apiClient.post(
    `/devices/${encodeURIComponent(deviceId)}/probes`,
    dto,
  )
  return ProbeSchema.parse(data)
}

export async function updateProbe(
  id: string,
  dto: ProbeInput,
): Promise<Probe> {
  const { data } = await apiClient.put(
    `/probes/${encodeURIComponent(id)}`,
    dto,
  )
  return ProbeSchema.parse(data)
}

export async function deleteProbe(id: string): Promise<Probe> {
  const { data } = await apiClient.delete(`/probes/${encodeURIComponent(id)}`)
  return ProbeSchema.parse(data)
}
