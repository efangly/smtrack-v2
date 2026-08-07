'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatDateTime } from '@/lib/utils'

import { timeTick, type ChartRow } from './telemetry-chart-utils'

export function TelemetryStatusStrip({
  data,
  dataKey,
  label,
  color,
  syncId,
  tickFormatter,
  showXAxis = false,
  height = 56,
}: {
  data: ChartRow[]
  dataKey: 'doorOpen' | 'internetUp'
  label: string
  color: string
  syncId: string
  tickFormatter: (value: number) => string
  showXAxis?: boolean
  height?: number
}) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          syncId={syncId}
          margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
        >
          <XAxis
            dataKey="sendTime"
            tickFormatter={timeTick}
            stroke="var(--chart-axis)"
            tick={showXAxis ? { fill: 'var(--chart-muted)', fontSize: 12 } : false}
            axisLine={showXAxis}
            tickLine={showXAxis}
            height={showXAxis ? 24 : 1}
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 1]}
            tickFormatter={tickFormatter}
            stroke={color}
            tick={{ fill: 'var(--chart-muted)', fontSize: 11 }}
            width={48}
          />
          <Tooltip
            labelFormatter={(value) => formatDateTime(value as string)}
            formatter={(value) => [tickFormatter(Number(value)), label]}
            contentStyle={{
              backgroundColor: 'var(--chart-surface)',
              borderColor: 'var(--chart-grid)',
            }}
            labelStyle={{ color: 'var(--chart-text-secondary)' }}
          />
          <Area
            type="stepAfter"
            dataKey={dataKey}
            name={label}
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-center text-xs" style={{ color }}>
        {label}
      </p>
    </div>
  )
}
