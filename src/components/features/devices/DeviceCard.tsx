'use client'

import Link from 'next/link'
import { Droplets, Thermometer } from 'lucide-react'

import type { Device } from '@/types/device'
import { useLatestTelemetry } from '@/hooks/useLatestTelemetry'
import { useDeviceProbeTelemetry } from '@/hooks/useDeviceProbeTelemetry'
import { Avatar } from '@/components/ui/Avatar'
import { resolveDeviceImageUrl } from '@/lib/imageUrl'

import { DeviceStatusBadge } from './DeviceStatusBadge'
import { DeviceTelemetryIcons } from './DeviceTelemetryIcons'
import { ProbeDoorIcons, ProbeStatusIcon, ProbeTelemetryLine } from './ProbeTelemetryLine'

function formatTime(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DeviceCard({ device }: { device: Device }) {
  const { data: telemetry } = useLatestTelemetry(device.serial)
  const { data: probes, isLoading: probesLoading } = useDeviceProbeTelemetry(device.id)
  const href = `/devices/${encodeURIComponent(device.staticName)}`
  const singleProbe = probes && probes.length === 1 ? probes[0] : undefined
  const multiProbe = probes && probes.length > 1 ? probes : undefined
  const positionPicUrl = resolveDeviceImageUrl(device.positionPic)

  return (
    <div className="flex flex-col gap-3 rounded-box surface-card p-4">
      <div className="flex items-start gap-3">
        {positionPicUrl && (
          <Avatar
            src={positionPicUrl}
            alt={device.name ?? device.serial ?? 'อุปกรณ์'}
            shape="square"
            fit="cover"
            size={64}
            className="shrink-0"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={href} className="min-w-0">
              <p className="truncate font-medium hover:underline">
                {device.name ?? '-'}
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
        </div>
      </div>

      {multiProbe ? (
        <div className="flex flex-col gap-1.5 rounded-lg bg-base-200 px-3 py-2">
          {multiProbe.map((probe) => (
            <ProbeTelemetryLine
              key={probe.id}
              probe={probe}
              showLabel
              online={device.online}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 rounded-lg bg-base-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-base-content/60" aria-hidden="true" />
            <span className="text-sm font-semibold tabular-nums">
              {probesLoading
                ? '…'
                : singleProbe?.tempDisplay !== undefined && singleProbe?.tempDisplay !== null
                  ? `${singleProbe.tempDisplay}°C`
                  : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-base-content/60" aria-hidden="true" />
            <span className="text-sm font-semibold tabular-nums">
              {probesLoading
                ? '…'
                : singleProbe?.humidityDisplay !== undefined &&
                    singleProbe?.humidityDisplay !== null
                  ? `${singleProbe.humidityDisplay}%`
                  : '—'}
            </span>
          </div>
          {singleProbe && (
            <div className="flex items-center gap-2">
              <ProbeStatusIcon probe={singleProbe} online={device.online} />
              <ProbeDoorIcons probe={singleProbe} />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-base-content/50">
        <span>อัปเดตล่าสุด {formatTime(telemetry?.sendTime)}</span>
        <DeviceTelemetryIcons telemetry={telemetry} />
      </div>
    </div>
  )
}
