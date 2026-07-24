'use client'

import { useQuery } from '@tanstack/react-query'

import { getDevices } from '@/lib/api/devices'

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
    refetchInterval: 20_000,
  })
}
