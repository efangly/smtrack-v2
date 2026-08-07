'use client'

import { useMemo, useState } from 'react'

import { Card } from '@/components/ui/Card'
import { useProbes } from '@/hooks/useProbes'

import { TelemetryGraph } from './TelemetryGraph'
import { TelemetryLiveFeed } from './TelemetryLiveFeed'
import { TelemetryTable } from './TelemetryTable'

const RANGE_OPTIONS = [
  { value: '1', label: '1 วัน' },
  { value: '7', label: '7 วัน' },
  { value: '30', label: '30 วัน' },
] as const

type RangeDays = (typeof RANGE_OPTIONS)[number]['value']

export function DeviceTelemetrySection({
  serial,
  deviceId,
}: {
  serial: string
  deviceId: string
}) {
  const [days, setDays] = useState<RangeDays>('1')
  // อุปกรณ์ที่มีมากกว่า 1 probe ต้องแยกกราฟ/ตารางต่อ probe ไม่งั้นข้อมูลจากทุก probe
  // จะถูกยิงมาปนกันในคำขอเดียว (`GET /telemetry?serial=X`) แล้วเรียงตามเวลาเป็นเส้น/
  // ตารางเดียว ดูเหมือนอ่านค่าผิดๆ — ถ้า probes โหลดไม่สำเร็จ ให้ fallback แสดงชุดเดียว
  // แบบเดิมแทนที่จะบล็อกทั้งหน้า
  const { data: probes } = useProbes(deviceId, { limit: 100 })
  const hasMultipleProbes = (probes?.length ?? 0) > 1

  // คำนวณด้วย useMemo ผูกกับ days เท่านั้น ไม่งั้น `to` จะขยับทุก re-render
  // ทำให้ queryKey ของ useTelemetry เปลี่ยนตลอดและ refetch วนไม่รู้จบ
  const { from, to } = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getTime() - Number(days) * 24 * 60 * 60 * 1000)
    return { from: start.toISOString(), to: now.toISOString() }
  }, [days])

  const rangeSelect = (
    <select
      className="select select-bordered select-sm"
      aria-label="ช่วงเวลา"
      value={days}
      onChange={(event) => setDays(event.target.value as RangeDays)}
    >
      {RANGE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )

  if (hasMultipleProbes) {
    return (
      <div className="flex flex-col gap-6">
        {probes!.map((probe) => {
          const label = probe.name ? ` — ${probe.name}` : ''
          return (
            <div key={probe.id} className="flex flex-col gap-6">
              <Card
                title={`กราฟอุณหภูมิ/ความชื้น/ประตู/อินเทอร์เน็ต${label}`}
                action={rangeSelect}
              >
                <TelemetryGraph
                  serial={serial}
                  probeId={probe.id}
                  from={from}
                  to={to}
                />
              </Card>

              <Card
                title={`ข้อมูล telemetry ล่าสุด${label}`}
                action={<TelemetryLiveFeed serial={serial} />}
              >
                <TelemetryTable
                  serial={serial}
                  probeId={probe.id}
                  from={from}
                  to={to}
                />
              </Card>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="กราฟอุณหภูมิ/ความชื้น/ประตู/อินเทอร์เน็ต" action={rangeSelect}>
        <TelemetryGraph
          serial={serial}
          probeId={probes?.[0]?.id}
          from={from}
          to={to}
        />
      </Card>

      <Card
        title="ข้อมูล telemetry ล่าสุด"
        action={<TelemetryLiveFeed serial={serial} />}
      >
        <TelemetryTable
          serial={serial}
          probeId={probes?.[0]?.id}
          from={from}
          to={to}
        />
      </Card>
    </div>
  )
}
