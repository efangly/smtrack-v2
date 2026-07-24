import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'

export const DailyRollupSchema = z.object({
  day: z.string(),
  serial: z.string(),
  avgTemp: z.coerce.number(),
  minTemp: z.coerce.number(),
  maxTemp: z.coerce.number(),
  samples: z.coerce.number(),
})
export type DailyRollup = z.infer<typeof DailyRollupSchema>

export async function getLogday(serial: string): Promise<DailyRollup[]> {
  const { data } = await apiClient.get(`/logday/${encodeURIComponent(serial)}`)
  return z.array(DailyRollupSchema).parse(data)
}
