'use client'

import { useQuery } from '@tanstack/react-query'

import { getRepairsCount } from '@/lib/api/repairs'

export function useRepairsInProgressCount() {
  return useQuery({
    queryKey: ['repairs', 'count', { status: 'in_progress' }],
    queryFn: () => getRepairsCount({ status: 'in_progress' }),
  })
}
