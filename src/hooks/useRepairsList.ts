'use client'

import { useQuery } from '@tanstack/react-query'

import { getRepairs } from '@/lib/api/repairs'
import type { PaginationQuery } from '@/lib/api/pagination'

export function useRepairsList(params: PaginationQuery = {}, enabled = true) {
  return useQuery({
    queryKey: ['repairs', 'all', params],
    queryFn: () => getRepairs(params),
    enabled,
  })
}
