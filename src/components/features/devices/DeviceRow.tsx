'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { Device } from '@/types/device'
import { useLatestTelemetry } from '@/hooks/useLatestTelemetry'
import { useDeviceProbeTelemetry } from '@/hooks/useDeviceProbeTelemetry'

import { DeviceStatusBadge } from './DeviceStatusBadge'
import { DeviceTelemetryIcons } from './DeviceTelemetryIcons'
import { ProbeDoorIcons, ProbeInfoLine, ProbeTempHumiLine } from './ProbeTelemetryLine'

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
        <>
          <td>
            <div className="flex flex-col gap-1 text-base-content/80">
              {multiProbe.map((probe) => (
                <ProbeInfoLine key={probe.id} probe={probe} online={device.online} />
              ))}
            </div>
          </td>
          <td className="tabular-nums">
            <div className="flex flex-col gap-1 text-base-content/80">
              {multiProbe.map((probe) => (
                <ProbeTempHumiLine key={probe.id} probe={probe} />
              ))}
            </div>
          </td>
          <td>
            <div className="flex flex-col gap-1">
              {multiProbe.map((probe) => (
                <div key={probe.id} className="flex h-5 items-center">
                  <ProbeDoorIcons probe={probe} />
                </div>
              ))}
            </div>
          </td>
        </>
      ) : (
        <>
          <td>
            {singleProbe && (
              <ProbeInfoLine probe={singleProbe} online={device.online} />
            )}
          </td>
          <td className="tabular-nums">
            {probesLoading
              ? '…'
              : singleProbe
                ? `${singleProbe.tempDisplay !== null ? `${singleProbe.tempDisplay}°C` : '—'} / ${
                    singleProbe.humidityDisplay !== null
                      ? `${singleProbe.humidityDisplay}%`
                      : '—'
                  }`
                : '—'}
          </td>
          <td>{singleProbe && <ProbeDoorIcons probe={singleProbe} />}</td>
        </>
      )}
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
          aria-label={`ดูรายละเอียด ${device.name ?? '-'}`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  )
}
