import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'

export const GraphPointSchema = z.object({
  bucket: z.string(),
  avgTemp: z.coerce.number(),
  avgHumidity: z.coerce.number(),
})
export type GraphPoint = z.infer<typeof GraphPointSchema>

export async function getGraph(serial: string): Promise<GraphPoint[]> {
  const { data } = await apiClient.get(`/graph/${encodeURIComponent(serial)}`)
  return z.array(GraphPointSchema).parse(data)
}
