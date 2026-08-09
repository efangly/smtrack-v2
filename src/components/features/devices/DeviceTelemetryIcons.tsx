'use client'

import type { ReactNode } from 'react'

import { Battery, BatteryLow, Plug, Wifi, WifiOff } from 'lucide-react'

import { SdCardIcon } from '@/components/ui/icons/SdCardIcon'
import type { LogDay } from '@/lib/api/telemetry'

export type Tone = 'success' | 'error' | 'warning' | 'muted'

export const TONE_CLASS: Record<Tone, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  muted: 'text-base-content/30',
}

// พื้นหลังจาง ๆ ของ tile ที่ครอบไอคอน — ให้สถานะอ่านออกโดยไม่ต้องเพ่งที่สีไอคอนอย่างเดียว
export const TONE_BG_CLASS: Record<Tone, string> = {
  success: 'bg-success/10',
  error: 'bg-error/10',
  warning: 'bg-warning/10',
  muted: '',
}

// telemetry === undefined หมายถึงยังไม่มีข้อมูลส่งเข้ามาเลย (ไม่ใช่ค่าปกติ) —
// ต้องแยกสีให้ต่างจากสถานะปกติ (success) ไม่งั้นจะดูเหมือนไม่มี status ใดๆ เลย
export function wifiTone(telemetry: LogDay | undefined): Tone {
  if (!telemetry) return 'muted'
  return telemetry.internet ? 'success' : 'error'
}

export function plugTone(telemetry: LogDay | undefined): Tone {
  if (!telemetry) return 'muted'
  return telemetry.plug ? 'success' : 'error'
}

export function batteryTone(telemetry: LogDay | undefined): Tone {
  if (!telemetry) return 'muted'
  if (telemetry.battery < 20) return 'error'
  if (telemetry.battery < 50) return 'warning'
  return 'success'
}

export function memoryTone(telemetry: LogDay | undefined): Tone {
  if (!telemetry) return 'muted'
  return telemetry.extMemory ? 'success' : 'error'
}

function TileWrap({
  tiles,
  tone,
  children,
}: {
  tiles: boolean
  tone: Tone
  children: ReactNode
}) {
  if (!tiles) return <>{children}</>
  return (
    <span
      className={`inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-base-300 px-2 ${TONE_BG_CLASS[tone]}`}
    >
      {children}
    </span>
  )
}

export function DeviceTelemetryIcons({
  telemetry,
  variant = 'inline',
}: {
  telemetry: LogDay | undefined
  variant?: 'inline' | 'tiles'
}) {
  const tiles = variant === 'tiles'
  const WifiIcon = telemetry && !telemetry.internet ? WifiOff : Wifi
  const BatteryIcon = telemetry && telemetry.battery < 20 ? BatteryLow : Battery
  const battery = batteryTone(telemetry)

  return (
    <div className={tiles ? 'flex items-center gap-2' : 'flex items-center gap-2.5'}>
      <TileWrap tiles={tiles} tone={wifiTone(telemetry)}>
        <WifiIcon
          className={`h-4 w-4 ${TONE_CLASS[wifiTone(telemetry)]}`}
          aria-label={telemetry ? (telemetry.internet ? 'สัญญาณปกติ' : 'สัญญาณขาดหาย') : 'ไม่มีข้อมูลสัญญาณ'}
        />
      </TileWrap>
      <TileWrap tiles={tiles} tone={plugTone(telemetry)}>
        <Plug
          className={`h-4 w-4 ${TONE_CLASS[plugTone(telemetry)]}`}
          aria-label={telemetry ? (telemetry.plug ? 'เสียบปลั๊กอยู่' : 'ปลั๊กหลุด') : 'ไม่มีข้อมูลปลั๊ก'}
        />
      </TileWrap>
      <TileWrap tiles={tiles} tone={memoryTone(telemetry)}>
        <SdCardIcon
          className={`h-4 w-4 ${TONE_CLASS[memoryTone(telemetry)]}`}
          aria-label={telemetry ? (telemetry.extMemory ? 'หน่วยความจำสำรองปกติ' : 'หน่วยความจำสำรองมีปัญหา') : 'ไม่มีข้อมูลหน่วยความจำสำรอง'}
        />
      </TileWrap>
      <TileWrap tiles={tiles} tone={battery}>
        <span className="flex items-center gap-1">
          <BatteryIcon
            className={`h-4 w-4 ${TONE_CLASS[battery]}`}
            aria-hidden="true"
          />
          <span className="text-xs tabular-nums text-base-content/70">
            {telemetry ? `${telemetry.battery}%` : '—'}
          </span>
        </span>
      </TileWrap>
    </div>
  )
}
