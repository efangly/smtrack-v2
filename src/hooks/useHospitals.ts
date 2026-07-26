'use client'

import { useQuery } from '@tanstack/react-query'

import { getHospitals } from '@/lib/api/hospitals'

export function useHospitals(enabled = true) {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: getHospitals,
    enabled,
    staleTime: 5 * 60_000,
  })
}
