'use client'

import { useQuery } from '@tanstack/react-query'

import { getWarranties } from '@/lib/api/warranty'

export function useWarranties(enabled = true) {
  return useQuery({
    queryKey: ['warranties'],
    queryFn: getWarranties,
    enabled,
  })
}
