'use client'

import { useQuery } from '@tanstack/react-query'

import { getRepairsBySerial } from '@/lib/api/repairs'
import type { PaginationQuery } from '@/lib/api/pagination'

export function useRepairs(serial: string, params: PaginationQuery = {}) {
  return useQuery({
    queryKey: ['repairs', serial, params],
    queryFn: () => getRepairsBySerial(serial, params),
    enabled: !!serial,
  })
}
