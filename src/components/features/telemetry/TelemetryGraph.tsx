'use client'

import { useTelemetry } from '@/hooks/useTelemetry'

import { TelemetryMainChart } from './TelemetryMainChart'
import { TelemetryStatusStrip } from './TelemetryStatusStrip'
import { doorTick, internetTick, toChartData } from './telemetry-chart-utils'

export function TelemetryGraph({
  serial,
  probeId,
  from,
  to,
  tempMin,
  tempMax,
}: {
  serial: string
  probeId?: string
  from?: string
  to?: string
  tempMin?: number | null
  tempMax?: number | null
}) {
  const { data, isLoading, isError } = useTelemetry({
    serial,
    probeId,
    from,
    to,
  })

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดกราฟได้</p>
  if (!data || data.length === 0)
    return <p className="text-base-content/60">ยังไม่มีข้อมูลกราฟ</p>

  const chartData = toChartData(data)
  const syncId = `telemetry-${serial}-${probeId ?? 'all'}`

  return (
    <div className="viz-root flex flex-col gap-2">
      <TelemetryMainChart
        data={chartData}
        syncId={syncId}
        tempMin={tempMin}
        tempMax={tempMax}
      />
      <TelemetryStatusStrip
        data={chartData}
        dataKey="doorOpen"
        label="ประตู"
        color="var(--chart-series-door)"
        tickFormatter={doorTick}
        syncId={syncId}
      />
      <TelemetryStatusStrip
        data={chartData}
        dataKey="internetUp"
        label="อินเทอร์เน็ต"
        color="var(--chart-series-internet)"
        tickFormatter={internetTick}
        syncId={syncId}
        showXAxis
      />
    </div>
  )
}
