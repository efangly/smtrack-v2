'use client'

import { useQuery } from '@tanstack/react-query'

import { getFirmwares } from '@/lib/api/firmware'
import type { PaginationQuery } from '@/lib/api/pagination'

export function useFirmwares(params: PaginationQuery = {}) {
  return useQuery({
    queryKey: ['firmware', params],
    queryFn: () => getFirmwares(params),
  })
}
