'use client'

import { useQuery } from '@tanstack/react-query'

import { getWarranties } from '@/lib/api/warranty'

export function useWarranties(
  enabled = true,
  params: { search?: string; expiringSoon?: boolean } = {},
) {
  return useQuery({
    queryKey: ['warranties', params],
    queryFn: () => getWarranties(params),
    enabled,
  })
}
