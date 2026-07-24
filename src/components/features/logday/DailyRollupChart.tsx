'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useLogday } from '@/hooks/useLogday'

function dayTick(value: string) {
  return new Date(value).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
  })
}

export function DailyRollupChart({ serial }: { serial: string }) {
  const { data, isLoading, isError } = useLogday(serial)

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดสรุปรายวันได้</p>
  if (!data || data.length === 0)
    return <p className="text-base-content/60">ยังไม่มีข้อมูลสรุป</p>

  return (
    <div className="viz-root">
      <h3
        className="mb-2 text-sm font-medium"
        style={{ color: 'var(--chart-text-secondary)' }}
      >
        อุณหภูมิเฉลี่ย/ต่ำสุด/สูงสุดรายวัน (7 วัน)
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={dayTick}
            stroke="var(--chart-axis)"
            tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
          />
          <YAxis
            stroke="var(--chart-axis)"
            tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
            unit="°C"
          />
          <Tooltip labelFormatter={(label) => dayTick(label as string)} />
          <Bar
            dataKey="maxTemp"
            fill="var(--chart-grid)"
            name="สูงสุด"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="avgTemp"
            stroke="var(--chart-series-temp)"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="เฉลี่ย"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
