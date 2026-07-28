'use client'

import { useQuery } from '@tanstack/react-query'

import { getProbes } from '@/lib/api/probes'
import type { PaginationQuery } from '@/lib/api/pagination'

export function useProbes(deviceId: string, params: PaginationQuery = {}) {
  return useQuery({
    queryKey: ['devices', deviceId, 'probes', params],
    queryFn: () => getProbes(deviceId, params),
    enabled: !!deviceId,
  })
}
