import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'
import type { PaginationQuery } from '@/lib/api/pagination'

export const NotificationSchema = z.object({
  id: z.string(),
  serial: z.string(),
  message: z.string(),
  detail: z.string(),
  status: z.boolean(),
  deliveredSse: z.boolean(),
  deliveredFcm: z.boolean(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type Notification = z.infer<typeof NotificationSchema>

export async function getNotifications(
  serial: string,
  params: PaginationQuery = {},
): Promise<Notification[]> {
  const { data } = await apiClient.get(
    `/notifications/${encodeURIComponent(serial)}`,
    { params },
  )
  return z.array(NotificationSchema).parse(data)
}
