'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { Device } from '@/types/device'
import { useLatestTelemetry } from '@/hooks/useLatestTelemetry'

import { DeviceStatusBadge } from './DeviceStatusBadge'
import { DeviceTelemetryIcons } from './DeviceTelemetryIcons'

export function DeviceRow({ device }: { device: Device }) {
  const { data: telemetry, isLoading } = useLatestTelemetry(device.serial)
  const href = `/devices/${encodeURIComponent(device.staticName)}`

  return (
    <tr className="hover">
      <td>
        <Link href={href} className="link link-primary font-mono">
          {device.serial ?? '-'}
        </Link>
      </td>
      <td className="font-medium">{device.name ?? device.staticName}</td>
      <td className="tabular-nums">
        {isLoading ? '…' : telemetry ? `${telemetry.tempDisplay}°C` : '—'}
      </td>
      <td className="tabular-nums">
        {isLoading ? '…' : telemetry ? `${telemetry.humidityDisplay}%` : '—'}
      </td>
      <td>
        <DeviceTelemetryIcons telemetry={telemetry} />
      </td>
      <td>
        <DeviceStatusBadge online={device.online} />
      </td>
      <td className="text-right">
        <Link
          href={href}
          className="btn btn-ghost btn-xs"
          aria-label={`ดูรายละเอียด ${device.name ?? device.staticName}`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  )
}
