'use client'

import { Battery, BatteryLow, MemoryStick, Plug, Wifi, WifiOff } from 'lucide-react'

import type { LogDay } from '@/lib/api/telemetry'

type Tone = 'success' | 'error' | 'warning' | 'muted'

const TONE_CLASS: Record<Tone, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  muted: 'text-base-content/30',
}

// telemetry === undefined หมายถึงยังไม่มีข้อมูลส่งเข้ามาเลย (ไม่ใช่ค่าปกติ) —
// ต้องแยกสีให้ต่างจากสถานะปกติ (success) ไม่งั้นจะดูเหมือนไม่มี status ใดๆ เลย
function wifiTone(telemetry: LogDay | undefined): Tone {
  if (!telemetry) return 'muted'
  return telemetry.internet ? 'success' : 'error'
}

function plugTone(telemetry: LogDay | undefined): Tone {
  if (!telemetry) return 'muted'
  return telemetry.plug ? 'success' : 'error'
}

function batteryTone(telemetry: LogDay | undefined): Tone {
  if (!telemetry) return 'muted'
  if (telemetry.battery < 20) return 'error'
  if (telemetry.battery < 50) return 'warning'
  return 'success'
}

function memoryTone(telemetry: LogDay | undefined): Tone {
  if (!telemetry) return 'muted'
  return telemetry.extMemory ? 'success' : 'error'
}

export function DeviceTelemetryIcons({
  telemetry,
}: {
  telemetry: LogDay | undefined
}) {
  const WifiIcon = telemetry && !telemetry.internet ? WifiOff : Wifi
  const BatteryIcon = telemetry && telemetry.battery < 20 ? BatteryLow : Battery

  return (
    <div className="flex items-center gap-2.5">
      <WifiIcon
        className={`h-4 w-4 ${TONE_CLASS[wifiTone(telemetry)]}`}
        aria-label={telemetry ? (telemetry.internet ? 'สัญญาณปกติ' : 'สัญญาณขาดหาย') : 'ไม่มีข้อมูลสัญญาณ'}
      />
      <Plug
        className={`h-4 w-4 ${TONE_CLASS[plugTone(telemetry)]}`}
        aria-label={telemetry ? (telemetry.plug ? 'เสียบปลั๊กอยู่' : 'ปลั๊กหลุด') : 'ไม่มีข้อมูลปลั๊ก'}
      />
      <MemoryStick
        className={`h-4 w-4 ${TONE_CLASS[memoryTone(telemetry)]}`}
        aria-label={telemetry ? (telemetry.extMemory ? 'หน่วยความจำสำรองปกติ' : 'หน่วยความจำสำรองมีปัญหา') : 'ไม่มีข้อมูลหน่วยความจำสำรอง'}
      />
      <span className="flex items-center gap-1">
        <BatteryIcon
          className={`h-4 w-4 ${TONE_CLASS[batteryTone(telemetry)]}`}
          aria-hidden="true"
        />
        <span className="text-xs tabular-nums text-base-content/70">
          {telemetry ? `${telemetry.battery}%` : '—'}
        </span>
      </span>
    </div>
  )
}
