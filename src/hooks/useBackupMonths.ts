'use client'

import { useQuery } from '@tanstack/react-query'

import { getBackupMonths } from '@/lib/api/backup'
import type { PaginationQuery } from '@/lib/api/pagination'

export function useBackupMonths(params: PaginationQuery = {}) {
  return useQuery({
    queryKey: ['backup', 'months', params],
    queryFn: () => getBackupMonths(params),
  })
}
