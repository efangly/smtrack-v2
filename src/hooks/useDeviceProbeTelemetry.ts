'use client'

import { useQuery } from '@tanstack/react-query'

import { getDeviceProbeTelemetry } from '@/lib/api/probes'

export function useDeviceProbeTelemetry(deviceId: string) {
  return useQuery({
    queryKey: ['devices', deviceId, 'probes', 'telemetry'],
    queryFn: () => getDeviceProbeTelemetry(deviceId),
    enabled: !!deviceId,
    refetchInterval: 20_000,
  })
}
