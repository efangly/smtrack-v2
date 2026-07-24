'use client'

import { LiveStatus } from '@/components/ui/LiveStatus'
import { useTelemetryLiveFeed } from '@/hooks/useTelemetryLiveFeed'

export function TelemetryLiveFeed({ serial }: { serial: string }) {
  const status = useTelemetryLiveFeed(serial)

  return <LiveStatus status={status} />
}
