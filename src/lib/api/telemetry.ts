import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'

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
  battery: z.number(),
  tempInternal: z.number().nullable(),
  extMemory: z.boolean(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type LogDay = z.infer<typeof LogDaySchema>

export interface QueryTelemetryParams {
  serial?: string
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
