'use client'

import { useQuery } from '@tanstack/react-query'

import { getTelemetry, type QueryTelemetryParams } from '@/lib/api/telemetry'

export function useTelemetry(params: QueryTelemetryParams) {
  return useQuery({
    queryKey: ['telemetry', params],
    queryFn: () => getTelemetry(params),
    enabled: !!params.serial,
  })
}
