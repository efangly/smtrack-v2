'use client'

import Link from 'next/link'
import { Thermometer } from 'lucide-react'

import type { Device } from '@/types/device'
import { useLatestTelemetry } from '@/hooks/useLatestTelemetry'
import { useDeviceProbeTelemetry } from '@/hooks/useDeviceProbeTelemetry'
import { Avatar } from '@/components/ui/Avatar'
import { resolveDeviceImageUrl } from '@/lib/imageUrl'

import { DeviceStatusBadge } from './DeviceStatusBadge'
import { DeviceTelemetryIcons } from './DeviceTelemetryIcons'
import {
  ProbeDoorBadges,
  ProbeInfoLine,
  TONE_CLASS,
  aggregateProbeTone,
} from './ProbeTelemetryLine'

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
  const positionPicUrl = resolveDeviceImageUrl(device.positionPic)
  const doorProbes = probes?.filter((probe) => probe.doorQty > 0) ?? []

  return (
    <div className="flex flex-col gap-3 rounded-box surface-card p-4">
      <div className="flex items-start gap-3">
        <Avatar
          src={positionPicUrl}
          alt={device.name ?? device.serial ?? 'อุปกรณ์'}
          shape="square"
          fit="cover"
          size={64}
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={href} className="min-w-0">
              <p className="truncate font-semibold hover:underline">
                {device.name ?? '-'}
              </p>
              <p className="truncate font-mono text-xs text-base-content/60">
                {device.serial ?? '-'}
              </p>
            </Link>
            <DeviceStatusBadge online={device.online} variant="pill" />
          </div>

          {device.position && (
            <p className="truncate text-sm text-base-content/70">{device.position}</p>
          )}
        </div>
      </div>

      {doorProbes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {doorProbes.map((probe) => (
            <ProbeDoorBadges key={probe.id} probe={probe} />
          ))}
        </div>
      )}

      {probesLoading ? (
        <div className="rounded-lg bg-base-200 px-3 py-2 text-sm text-base-content/50">…</div>
      ) : probes && probes.length > 0 ? (
        <div className="flex flex-col gap-2">
          {probes.map((probe) => (
            <div key={probe.id} className="flex flex-wrap items-center gap-2">
              <ProbeInfoLine probe={probe} online={device.online} />
              <span className="inline-flex items-center gap-2 text-sm font-semibold tabular-nums">
                <span className="rounded-lg border border-base-300 px-2.5 py-1">
                  {probe.tempDisplay !== null ? `${probe.tempDisplay}°C` : '—'}
                </span>
                <span className="rounded-lg border border-base-300 px-2.5 py-1">
                  {probe.humidityDisplay !== null ? `${probe.humidityDisplay}%` : '—'}
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <span className="rounded-lg border border-base-300 px-2.5 py-1 text-xs text-base-content/60">
          {formatTime(telemetry?.sendTime)}
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 items-center justify-center rounded-lg border border-base-300 px-2">
            <Thermometer
              className={`h-4 w-4 ${TONE_CLASS[aggregateProbeTone(probes, device.online)]}`}
              aria-label="สถานะ probe โดยรวม"
            />
          </span>
          <DeviceTelemetryIcons telemetry={telemetry} variant="tiles" />
        </div>
      </div>
    </div>
  )
}
