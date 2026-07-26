'use client'

import { useQuery } from '@tanstack/react-query'

import { getProbes } from '@/lib/api/probes'

export function useProbes(deviceId: string) {
  return useQuery({
    queryKey: ['devices', deviceId, 'probes'],
    queryFn: () => getProbes(deviceId),
    enabled: !!deviceId,
  })
}
