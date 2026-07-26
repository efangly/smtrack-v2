'use client'

import { useQuery } from '@tanstack/react-query'

import { getAuthHealth } from '@/lib/api/auth'

export function useAuthHealth() {
  return useQuery({
    queryKey: ['authHealth'],
    queryFn: getAuthHealth,
    staleTime: 60_000,
    retry: false,
  })
}
