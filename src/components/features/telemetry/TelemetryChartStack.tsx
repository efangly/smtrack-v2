'use client'

import { TelemetryMainChart } from './TelemetryMainChart'
import { TelemetryStatusStrip } from './TelemetryStatusStrip'
import { doorTick, internetTick, type ChartRow } from './telemetry-chart-utils'

export function TelemetryChartStack({
  data,
  syncId,
  tempMin,
  tempMax,
  mainHeight,
  stripHeight,
  zoomable = false,
  refAreaLeft,
  refAreaRight,
  onSelectStart,
  onSelectMove,
  onSelectEnd,
}: {
  data: ChartRow[]
  syncId: string
  tempMin?: number | null
  tempMax?: number | null
  mainHeight?: number
  stripHeight?: number
  zoomable?: boolean
  refAreaLeft?: string
  refAreaRight?: string
  onSelectStart?: (label: string) => void
  onSelectMove?: (label: string) => void
  onSelectEnd?: () => void
}) {
  return (
    <div className="viz-root flex flex-col gap-2">
      <TelemetryMainChart
        data={data}
        syncId={syncId}
        tempMin={tempMin}
        tempMax={tempMax}
        height={mainHeight}
        zoomable={zoomable}
        refAreaLeft={refAreaLeft}
        refAreaRight={refAreaRight}
        onSelectStart={onSelectStart}
        onSelectMove={onSelectMove}
        onSelectEnd={onSelectEnd}
      />
      <TelemetryStatusStrip
        data={data}
        dataKey="doorOpen"
        label="ประตู"
        color="var(--chart-series-door)"
        tickFormatter={doorTick}
        syncId={syncId}
        height={stripHeight}
      />
      <TelemetryStatusStrip
        data={data}
        dataKey="internetUp"
        label="อินเทอร์เน็ต"
        color="var(--chart-series-internet)"
        tickFormatter={internetTick}
        syncId={syncId}
        height={stripHeight}
        showXAxis
      />
    </div>
  )
}
