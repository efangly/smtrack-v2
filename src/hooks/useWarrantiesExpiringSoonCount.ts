'use client'

import { useQuery } from '@tanstack/react-query'

import { getWarrantiesCount } from '@/lib/api/warranty'

export function useWarrantiesExpiringSoonCount() {
  return useQuery({
    queryKey: ['warranties', 'count', { expiringSoon: true }],
    queryFn: () => getWarrantiesCount({ expiringSoon: true }),
  })
}
