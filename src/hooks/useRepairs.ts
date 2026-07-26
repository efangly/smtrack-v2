'use client'

import { useQuery } from '@tanstack/react-query'

import { getRepairsBySerial } from '@/lib/api/repairs'

export function useRepairs(serial: string) {
  return useQuery({
    queryKey: ['repairs', serial],
    queryFn: () => getRepairsBySerial(serial),
    enabled: !!serial,
  })
}
