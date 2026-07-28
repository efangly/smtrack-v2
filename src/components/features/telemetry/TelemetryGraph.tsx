'use client'

import { useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useTelemetry } from '@/hooks/useTelemetry'
import { formatDateTime } from '@/lib/utils'

function timeTick(value: string) {
  return new Date(value).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function doorTick(value: number) {
  return value ? 'เปิด' : 'ปิด'
}

export function TelemetryGraph({ serial }: { serial: string }) {
  const { data, isLoading, isError } = useTelemetry({ serial, limit: 50 })
  // คลิกที่ legend เพื่อซ่อน/แสดงเส้นแต่ละเส้น — เก็บ key ที่ถูกซ่อนไว้ใน state
  const [hidden, setHidden] = useState<Record<string, boolean>>({})

  const toggleSeries = (dataKey: string) =>
    setHidden((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }))

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดกราฟได้</p>
  if (!data || data.length === 0)
    return <p className="text-base-content/60">ยังไม่มีข้อมูลกราฟ</p>

  // /telemetry ส่งข้อมูลใหม่สุดมาก่อน (เหมือนที่ TelemetryTable ใช้) ต้องกลับลำดับ
  // ให้เก่า→ใหม่ ก่อนเข้ากราฟเส้น ไม่งั้นแกนเวลาจะวิ่งย้อนกลับ
  const chartData = [...data].reverse().map((row) => ({
    ...row,
    doorOpen: row.door1 || row.door2 || row.door3 ? 1 : 0,
  }))

  return (
    <div className="viz-root">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={chartData}
          margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
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
          <YAxis
            yAxisId="door"
            orientation="right"
            stroke="var(--chart-series-door)"
            tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
            type="number"
            domain={[0, 1]}
            ticks={[0, 1]}
            tickFormatter={doorTick}
            width={56}
          />
          <Tooltip
            labelFormatter={(label) => formatDateTime(label as string)}
            formatter={(value, name) => {
              if (name === 'ประตู') return [doorTick(Number(value)), name]
              if (name === 'อุณหภูมิ') return [`${Number(value).toFixed(1)}°C`, name]
              if (name === 'ความชื้น') return [`${Number(value).toFixed(1)}%`, name]
              return [value, name]
            }}
          />
          <Legend
            onClick={(entry) => toggleSeries(String(entry.dataKey))}
            wrapperStyle={{ fontSize: 12, color: 'var(--chart-muted)', cursor: 'pointer' }}
            formatter={(value, entry) => (
              <span
                style={{
                  textDecoration: hidden[String(entry.dataKey)]
                    ? 'line-through'
                    : 'none',
                  opacity: hidden[String(entry.dataKey)] ? 0.5 : 1,
                }}
              >
                {value}
              </span>
            )}
          />
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
          <Line
            yAxisId="door"
            type="stepAfter"
            dataKey="doorOpen"
            name="ประตู"
            stroke="var(--chart-series-door)"
            strokeWidth={2}
            dot={false}
            hide={hidden.doorOpen}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
