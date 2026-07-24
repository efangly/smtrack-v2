'use client'

import { useQueryClient } from '@tanstack/react-query'

import type { QueryTelemetryParams } from '@/lib/api/telemetry'
import { LogDaySchema, type LogDay } from '@/lib/api/telemetry'
import { useSse, type SseStatus } from '@/hooks/useSse'

const MAX_CACHED_POINTS = 100

export function useTelemetryLiveFeed(serial: string): SseStatus {
  const queryClient = useQueryClient()

  return useSse<LogDay>('/telemetry/stream', 'telemetry', (raw) => {
    const point = LogDaySchema.safeParse(raw)
    if (!point.success || point.data.serial !== serial) return

    queryClient.setQueriesData<LogDay[]>(
      {
        predicate: (query) => {
          const [key, params] = query.queryKey as [
            string,
            QueryTelemetryParams?,
          ]
          return key === 'telemetry' && params?.serial === serial
        },
      },
      (old) =>
        old ? [point.data, ...old].slice(0, MAX_CACHED_POINTS) : [point.data],
    )
  })
}
