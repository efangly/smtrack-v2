'use client'

import { useQuery } from '@tanstack/react-query'

import { getTelemetry } from '@/lib/api/telemetry'

export function useLatestTelemetry(serial: string | null) {
  return useQuery({
    queryKey: ['telemetry', { serial, limit: 1 }],
    queryFn: () => getTelemetry({ serial: serial as string, limit: 1 }),
    enabled: !!serial,
    refetchInterval: 20_000,
    select: (data) => data[0],
  })
}
