'use client'

import { useQuery } from '@tanstack/react-query'

import { getDeviceAudit } from '@/lib/api/deviceAudit'

export function useDeviceAudit(staticName: string) {
  return useQuery({
    queryKey: ['devices', staticName, 'audit'],
    queryFn: () => getDeviceAudit(staticName),
    enabled: !!staticName,
  })
}
