'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { Device } from '@/types/device'
import { useLatestTelemetry } from '@/hooks/useLatestTelemetry'
import { useDeviceProbeTelemetry } from '@/hooks/useDeviceProbeTelemetry'

import { DeviceStatusBadge } from './DeviceStatusBadge'
import { DeviceTelemetryIcons } from './DeviceTelemetryIcons'
import { ProbeDoorIcons, ProbeStatusIcon, ProbeTelemetryLine } from './ProbeTelemetryLine'

export function DeviceRow({ device }: { device: Device }) {
  const { data: telemetry } = useLatestTelemetry(device.serial)
  const { data: probes, isLoading: probesLoading } = useDeviceProbeTelemetry(device.id)
  const href = `/devices/${encodeURIComponent(device.staticName)}`
  const singleProbe = probes && probes.length === 1 ? probes[0] : undefined
  const multiProbe = probes && probes.length > 1 ? probes : undefined

  return (
    <tr className="hover">
      <td>
        <Link href={href} className="link link-primary font-mono">
          {device.serial ?? '-'}
        </Link>
      </td>
      <td className="font-medium">{device.name ?? '-'}</td>
      {multiProbe ? (
        <td colSpan={2} className="tabular-nums">
          <div className="flex flex-col gap-1 text-base-content/80">
            {multiProbe.map((probe) => (
              <ProbeTelemetryLine
                key={probe.id}
                probe={probe}
                showLabel
                online={device.online}
              />
            ))}
          </div>
        </td>
      ) : (
        <>
          <td className="tabular-nums">
            {probesLoading
              ? '…'
              : singleProbe?.tempDisplay !== undefined && singleProbe?.tempDisplay !== null
                ? `${singleProbe.tempDisplay}°C`
                : '—'}
          </td>
          <td className="tabular-nums">
            {probesLoading
              ? '…'
              : singleProbe?.humidityDisplay !== undefined &&
                  singleProbe?.humidityDisplay !== null
                ? `${singleProbe.humidityDisplay}%`
                : '—'}
          </td>
        </>
      )}
      <td>
        <div className="flex items-center gap-3">
          {singleProbe && (
            <>
              <ProbeStatusIcon probe={singleProbe} online={device.online} />
              <ProbeDoorIcons probe={singleProbe} />
            </>
          )}
          <DeviceTelemetryIcons telemetry={telemetry} />
        </div>
      </td>
      <td>
        <DeviceStatusBadge online={device.online} />
      </td>
      <td className="text-right">
        <Link
          href={href}
          className="btn btn-ghost btn-xs"
          aria-label={`ดูรายละเอียด ${device.name ?? '-'}`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  )
}
