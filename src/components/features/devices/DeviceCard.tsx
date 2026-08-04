'use client'

import Link from 'next/link'
import { Droplets, Thermometer } from 'lucide-react'

import type { Device } from '@/types/device'
import { useLatestTelemetry } from '@/hooks/useLatestTelemetry'

import { DeviceStatusBadge } from './DeviceStatusBadge'
import { DeviceTelemetryIcons } from './DeviceTelemetryIcons'

function formatTime(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DeviceCard({ device }: { device: Device }) {
  const { data: telemetry, isLoading } = useLatestTelemetry(device.serial)
  const href = `/devices/${encodeURIComponent(device.staticName)}`

  return (
    <div className="flex flex-col gap-3 rounded-box surface-card p-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={href} className="min-w-0">
          <p className="truncate font-medium hover:underline">
            {device.name ?? device.staticName}
          </p>
          <p className="truncate font-mono text-xs text-base-content/60">
            {device.serial ?? '-'}
          </p>
        </Link>
        <DeviceStatusBadge online={device.online} />
      </div>

      {device.position && (
        <p className="truncate text-sm text-base-content/70">{device.position}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-base-200 px-3 py-2">
          <Thermometer className="h-4 w-4 text-base-content/60" aria-hidden="true" />
          <span className="text-sm font-semibold tabular-nums">
            {isLoading ? '…' : telemetry ? `${telemetry.tempDisplay}°C` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-base-200 px-3 py-2">
          <Droplets className="h-4 w-4 text-base-content/60" aria-hidden="true" />
          <span className="text-sm font-semibold tabular-nums">
            {isLoading ? '…' : telemetry ? `${telemetry.humidityDisplay}%` : '—'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-base-content/50">
        <span>อัปเดตล่าสุด {formatTime(telemetry?.sendTime)}</span>
        <DeviceTelemetryIcons telemetry={telemetry} />
      </div>
    </div>
  )
}
