'use client'

import type { ReactNode } from 'react'

import type { Device } from '@/lib/api/devices'
import type { ProbeTelemetry } from '@/lib/api/probes'
import { useLatestTelemetry } from '@/hooks/useLatestTelemetry'
import { useDeviceProbeTelemetry } from '@/hooks/useDeviceProbeTelemetry'

import {
  TONE_CLASS as TELEMETRY_TONE_CLASS,
  batteryTone,
  memoryTone,
  plugTone,
  wifiTone,
} from './DeviceTelemetryIcons'
import {
  ProbeDoorBadges,
  TONE_CLASS as PROBE_TONE_CLASS,
  probeStatusTone,
} from './ProbeTelemetryLine'

function StatItem({
  label,
  value,
  toneClass,
}: {
  label: string
  value: ReactNode
  toneClass: string
}) {
  return (
    <div>
      <dt className="text-base-content/60">{label}</dt>
      <dd className={`font-semibold tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  )
}

function probeLabel(probe: ProbeTelemetry) {
  return `CH${probe.channel}${probe.name ? ` ${probe.name}` : ''}`
}

// รายการ dt/dd สถานะอุปกรณ์ — ใช้แทรกเข้า dl เดียวกับ Serial/Firmware/ตำแหน่ง
export function DeviceInfoStats({ device }: { device: Device }) {
  const { data: telemetry } = useLatestTelemetry(device.id)
  const { data: probes } = useDeviceProbeTelemetry(device.id)
  const doorProbes = probes?.filter((probe) => probe.doorQty > 0) ?? []

  return (
    <>
      {probes?.map((probe) => (
        <StatItem
          key={probe.id}
          label={`โพรบ ${probeLabel(probe)}`}
          toneClass={PROBE_TONE_CLASS[probeStatusTone(probe, device.online)]}
          value={
            <>
              {probe.tempDisplay !== null ? `${probe.tempDisplay}°C` : '—'}
              {' / '}
              {probe.humidityDisplay !== null ? `${probe.humidityDisplay}%` : '—'}
            </>
          }
        />
      ))}

      <StatItem
        label="การเชื่อมต่อ"
        toneClass={TELEMETRY_TONE_CLASS[wifiTone(telemetry)]}
        value={telemetry ? (telemetry.internet ? 'เชื่อมต่อแล้ว' : 'ขาดการเชื่อมต่อ') : '—'}
      />

      {doorProbes.map((probe) => (
        <div key={probe.id}>
          <dt className="text-base-content/60">{`ประตู ${probeLabel(probe)}`}</dt>
          <dd>
            <ProbeDoorBadges probe={probe} />
          </dd>
        </div>
      ))}

      <StatItem
        label="ปลั๊ก"
        toneClass={TELEMETRY_TONE_CLASS[plugTone(telemetry)]}
        value={telemetry ? (telemetry.plug ? 'ปกติ' : 'ปลั๊กหลุด') : '—'}
      />

      <StatItem
        label="เอสดีการ์ด"
        toneClass={TELEMETRY_TONE_CLASS[memoryTone(telemetry)]}
        value={telemetry ? (telemetry.extMemory ? 'ปกติ' : 'มีปัญหา') : '—'}
      />

      <StatItem
        label="แบตเตอรี่"
        toneClass={TELEMETRY_TONE_CLASS[batteryTone(telemetry)]}
        value={telemetry ? `${telemetry.battery}%` : '—'}
      />
    </>
  )
}
