'use client'

import { useQuery } from '@tanstack/react-query'

import { getDeviceAudit } from '@/lib/api/deviceAudit'
import type { PaginationQuery } from '@/lib/api/pagination'

export function useDeviceAudit(
  staticName: string,
  params: PaginationQuery = {},
) {
  return useQuery({
    queryKey: ['devices', staticName, 'audit', params],
    queryFn: () => getDeviceAudit(staticName, params),
    enabled: !!staticName,
  })
}
