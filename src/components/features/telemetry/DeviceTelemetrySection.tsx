'use client'

import { useMemo, useRef, useState } from 'react'
import { Maximize2 } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { useProbes } from '@/hooks/useProbes'

import { TelemetryGraph, type TelemetryGraphHandle } from './TelemetryGraph'
import { TelemetryLiveFeed } from './TelemetryLiveFeed'
import { TelemetryTable } from './TelemetryTable'

function ExpandChartButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm btn-square"
      aria-label="ขยายกราฟเต็มจอ"
      onClick={onClick}
    >
      <Maximize2 className="size-4" />
    </button>
  )
}

const RANGE_OPTIONS = [
  { value: '1', label: '1 วัน' },
  { value: '7', label: '7 วัน' },
  { value: '30', label: '30 วัน' },
] as const

type RangeDays = (typeof RANGE_OPTIONS)[number]['value']

export function DeviceTelemetrySection({
  serial,
  deviceId,
  deviceName,
}: {
  serial: string
  deviceId: string
  deviceName?: string | null
}) {
  const [days, setDays] = useState<RangeDays>('1')
  // อุปกรณ์ที่มีมากกว่า 1 probe ต้องแยกกราฟ/ตารางต่อ probe ไม่งั้นข้อมูลจากทุก probe
  // จะถูกยิงมาปนกันในคำขอเดียว (`GET /telemetry?serial=X`) แล้วเรียงตามเวลาเป็นเส้น/
  // ตารางเดียว ดูเหมือนอ่านค่าผิดๆ — ถ้า probes โหลดไม่สำเร็จ ให้ fallback แสดงชุดเดียว
  // แบบเดิมแทนที่จะบล็อกทั้งหน้า
  const { data: probes } = useProbes(deviceId, { limit: 100 })
  const hasMultipleProbes = (probes?.length ?? 0) > 1

  const singleGraphRef = useRef<TelemetryGraphHandle>(null)
  const probeGraphRefs = useRef<Map<string, TelemetryGraphHandle>>(new Map())

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
        {/* ตัวบอกสถานะ live ของทั้ง section — ต้องอยู่นอกลูป probe เพราะ
            TelemetryLiveFeed ผูกกับ serial ไม่ใช่ probe (ทุกตัวรับ stream เดียวกัน)
            เรนเดอร์ซ้ำต่อ probe ก็ได้แค่ subscriber ซ้ำและป้ายสถานะซ้ำเปล่า ๆ */}
        <div className="flex justify-end">
          <TelemetryLiveFeed serial={serial} />
        </div>

        {probes!.map((probe) => {
          const label = probe.name ? ` — ${probe.name}` : ''
          return (
            <div key={probe.id} className="flex flex-col gap-6">
              <Card
                title={`กราฟอุณหภูมิ/ความชื้น/ประตู/อินเทอร์เน็ต${label}`}
                action={
                  <div className="flex items-center gap-2">
                    {rangeSelect}
                    <ExpandChartButton
                      onClick={() => probeGraphRefs.current.get(probe.id)?.openFullscreen()}
                    />
                  </div>
                }
              >
                <TelemetryGraph
                  ref={(handle) => {
                    if (handle) probeGraphRefs.current.set(probe.id, handle)
                    else probeGraphRefs.current.delete(probe.id)
                  }}
                  serial={serial}
                  probeId={probe.id}
                  from={from}
                  to={to}
                  tempMin={probe.tempMin}
                  tempMax={probe.tempMax}
                  title={`กราฟอุณหภูมิ/ความชื้น/ประตู/อินเทอร์เน็ต${label}`}
                  deviceName={deviceName}
                  probeName={probe.name}
                />
              </Card>

              <Card title={`ข้อมูล telemetry ล่าสุด${label}`}>
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

  const singleProbeLabel = probes?.[0]?.name ? ` — ${probes[0].name}` : ''

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={`กราฟอุณหภูมิ/ความชื้น/ประตู/อินเทอร์เน็ต${singleProbeLabel}`}
        action={
          <div className="flex items-center gap-2">
            {rangeSelect}
            <ExpandChartButton onClick={() => singleGraphRef.current?.openFullscreen()} />
          </div>
        }
      >
        <TelemetryGraph
          ref={singleGraphRef}
          serial={serial}
          probeId={probes?.[0]?.id}
          from={from}
          to={to}
          tempMin={probes?.[0]?.tempMin}
          tempMax={probes?.[0]?.tempMax}
          title={`กราฟอุณหภูมิ/ความชื้น/ประตู/อินเทอร์เน็ต${singleProbeLabel}`}
          deviceName={deviceName}
          probeName={probes?.[0]?.name}
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
