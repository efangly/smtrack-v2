'use client'

import { useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatDateTime } from '@/lib/utils'

import { timeTick, type ChartRow } from './telemetry-chart-utils'

function ThresholdLine({
  y,
  label,
}: {
  y: number | null | undefined
  label: string
}) {
  if (y === null || y === undefined) return null
  return (
    <ReferenceLine
      yAxisId="temp"
      y={y}
      ifOverflow="extendDomain"
      stroke="var(--chart-threshold)"
      strokeDasharray="4 4"
      strokeWidth={1.5}
      label={{
        value: label,
        position: 'insideBottomLeft',
        fill: 'var(--chart-muted)',
        fontSize: 10,
      }}
    />
  )
}

export function TelemetryMainChart({
  data,
  syncId,
  height = 240,
  tempMin,
  tempMax,
  zoomable = false,
  refAreaLeft,
  refAreaRight,
  onSelectStart,
  onSelectMove,
  onSelectEnd,
}: {
  data: ChartRow[]
  syncId: string
  height?: number
  tempMin?: number | null
  tempMax?: number | null
  zoomable?: boolean
  refAreaLeft?: string
  refAreaRight?: string
  onSelectStart?: (label: string) => void
  onSelectMove?: (label: string) => void
  onSelectEnd?: () => void
}) {
  // คลิกที่ legend เพื่อซ่อน/แสดงเส้นแต่ละเส้น — เก็บ key ที่ถูกซ่อนไว้ใน state
  const [hidden, setHidden] = useState<Record<string, boolean>>({})

  const toggleSeries = (dataKey: string) =>
    setHidden((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        syncId={syncId}
        margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
        style={zoomable ? { cursor: 'crosshair' } : undefined}
        onMouseDown={
          zoomable
            ? (state: { activeLabel?: string | number }) => {
                if (state?.activeLabel !== undefined) onSelectStart?.(String(state.activeLabel))
              }
            : undefined
        }
        onMouseMove={
          zoomable
            ? (state: { activeLabel?: string | number }) => {
                if (refAreaLeft && state?.activeLabel !== undefined)
                  onSelectMove?.(String(state.activeLabel))
              }
            : undefined
        }
        onMouseUp={zoomable ? () => onSelectEnd?.() : undefined}
      >
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
        <XAxis
          dataKey="sendTime"
          tickFormatter={timeTick}
          stroke="var(--chart-axis)"
          tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
        />
        <YAxis
          yAxisId="temp"
          stroke="var(--chart-series-temp)"
          tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
          unit="°C"
          width={48}
        />
        <YAxis
          yAxisId="humidity"
          orientation="right"
          stroke="var(--chart-series-humidity)"
          tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
          unit="%"
          width={48}
        />
        <Tooltip
          labelFormatter={(label) => formatDateTime(label as string)}
          formatter={(value, name) => {
            if (name === 'อุณหภูมิ') return [`${Number(value).toFixed(1)}°C`, name]
            if (name === 'ความชื้น') return [`${Number(value).toFixed(1)}%`, name]
            return [value, name]
          }}
          contentStyle={{
            backgroundColor: 'var(--chart-surface)',
            borderColor: 'var(--chart-grid)',
          }}
          labelStyle={{ color: 'var(--chart-text-secondary)' }}
        />
        <Legend
          onClick={(entry) => toggleSeries(String(entry.dataKey))}
          wrapperStyle={{ fontSize: 12, color: 'var(--chart-muted)', cursor: 'pointer' }}
          formatter={(value, entry) => (
            <span
              style={{
                textDecoration: hidden[String(entry.dataKey)] ? 'line-through' : 'none',
                opacity: hidden[String(entry.dataKey)] ? 0.5 : 1,
              }}
            >
              {value}
            </span>
          )}
        />
        <ThresholdLine y={tempMin} label="Min" />
        <ThresholdLine y={tempMax} label="Max" />
        {zoomable && refAreaLeft && refAreaRight && (
          <ReferenceArea
            yAxisId="temp"
            x1={refAreaLeft}
            x2={refAreaRight}
            strokeOpacity={0.3}
            fill="var(--chart-threshold)"
            fillOpacity={0.15}
          />
        )}
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="tempDisplay"
          name="อุณหภูมิ"
          stroke="var(--chart-series-temp)"
          strokeWidth={2}
          dot={false}
          hide={hidden.tempDisplay}
        />
        <Line
          yAxisId="humidity"
          type="monotone"
          dataKey="humidityDisplay"
          name="ความชื้น"
          stroke="var(--chart-series-humidity)"
          strokeWidth={2}
          dot={false}
          hide={hidden.humidityDisplay}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
