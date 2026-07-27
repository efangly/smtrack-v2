'use client'

import {
  Battery,
  BatteryLow,
  DoorClosed,
  DoorOpen,
  MemoryStick,
  Plug,
  Wifi,
  WifiOff,
} from 'lucide-react'

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

// เช็คว่ามีประตูช่องไหนเปิดอยู่บ้าง — ใช้เงื่อนไขเดียวกับคอลัมน์ "ประตู" ใน
// TelemetryTable.tsx (door1 || door2 || door3 → เปิด) เพื่อให้ความหมายตรงกันทั้งแอป
function isAnyDoorOpen(telemetry: LogDay): boolean {
  return telemetry.door1 || telemetry.door2 || telemetry.door3
}

function doorTone(telemetry: LogDay | undefined): Tone {
  if (!telemetry) return 'muted'
  return isAnyDoorOpen(telemetry) ? 'error' : 'success'
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
  const DoorIcon = telemetry && isAnyDoorOpen(telemetry) ? DoorOpen : DoorClosed

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
      <DoorIcon
        className={`h-4 w-4 ${TONE_CLASS[doorTone(telemetry)]}`}
        aria-label={telemetry ? (isAnyDoorOpen(telemetry) ? 'ประตูเปิดอยู่' : 'ประตูปิดสนิท') : 'ไม่มีข้อมูลประตู'}
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
