import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'
import type { PaginationQuery } from '@/lib/api/pagination'

const FieldDiffSchema = z.record(
  z.string(),
  z.object({ from: z.unknown(), to: z.unknown() }),
)
export type FieldDiff = z.infer<typeof FieldDiffSchema>

export const DeviceAuditSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  staticName: z.string(),
  action: z.string(),
  actorId: z.string().nullable(),
  actorName: z.string().nullable(),
  actorRole: z.string().nullable(),
  diff: FieldDiffSchema.nullable(),
  createAt: z.string(),
})
export type DeviceAudit = z.infer<typeof DeviceAuditSchema>

export async function getDeviceAudit(
  staticName: string,
  params: PaginationQuery = {},
): Promise<DeviceAudit[]> {
  const { data } = await apiClient.get(
    `/devices/by-name/${encodeURIComponent(staticName)}/audit`,
    { params },
  )
  return z.array(DeviceAuditSchema).parse(data)
}
