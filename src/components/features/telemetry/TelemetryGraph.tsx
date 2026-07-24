'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useGraph } from '@/hooks/useGraph'
import { formatDateTime } from '@/lib/utils'

function bucketTick(value: string) {
  return new Date(value).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TelemetryGraph({ serial }: { serial: string }) {
  const { data, isLoading, isError } = useGraph(serial)

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดกราฟได้</p>
  if (!data || data.length === 0)
    return <p className="text-base-content/60">ยังไม่มีข้อมูลกราฟ</p>

  return (
    <div className="viz-root grid gap-6 md:grid-cols-2">
      <div>
        <h3
          className="mb-2 text-sm font-medium"
          style={{ color: 'var(--chart-text-secondary)' }}
        >
          อุณหภูมิเฉลี่ยรายชั่วโมง (24 ชม.)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="bucket"
              tickFormatter={bucketTick}
              stroke="var(--chart-axis)"
              tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
            />
            <YAxis
              stroke="var(--chart-axis)"
              tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
              unit="°C"
            />
            <Tooltip
              labelFormatter={(label) => formatDateTime(label as string)}
              formatter={(value) => [
                `${Number(value).toFixed(1)}°C`,
                'อุณหภูมิ',
              ]}
            />
            <Line
              type="monotone"
              dataKey="avgTemp"
              stroke="var(--chart-series-temp)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3
          className="mb-2 text-sm font-medium"
          style={{ color: 'var(--chart-text-secondary)' }}
        >
          ความชื้นเฉลี่ยรายชั่วโมง (24 ชม.)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="bucket"
              tickFormatter={bucketTick}
              stroke="var(--chart-axis)"
              tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
            />
            <YAxis
              stroke="var(--chart-axis)"
              tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
              unit="%"
            />
            <Tooltip
              labelFormatter={(label) => formatDateTime(label as string)}
              formatter={(value) => [
                `${Number(value).toFixed(1)}%`,
                'ความชื้น',
              ]}
            />
            <Line
              type="monotone"
              dataKey="avgHumidity"
              stroke="var(--chart-series-humidity)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
