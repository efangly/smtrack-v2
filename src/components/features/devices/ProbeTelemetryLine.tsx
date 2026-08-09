'use client'

import { DoorClosed, DoorOpen, Thermometer } from 'lucide-react'

import type { ProbeTelemetry } from '@/lib/api/probes'

export type Tone = 'success' | 'error' | 'muted'

export const TONE_CLASS: Record<Tone, string> = {
  success: 'text-success',
  error: 'text-error',
  muted: 'text-base-content/30',
}

// พื้นหลังจาง ๆ ของ tile ที่ครอบไอคอน — ให้สถานะอ่านออกโดยไม่ต้องเพ่งที่สีไอคอนอย่างเดียว
export const TONE_BG_CLASS: Record<Tone, string> = {
  success: 'bg-success/10',
  error: 'bg-error/10',
  muted: '',
}

export function doorTone(open: boolean | null): Tone {
  if (open === null) return 'muted'
  return open ? 'error' : 'success'
}

// จำนวนไอคอนประตูต่อ probe อิงจาก doorQty จริง (ตัดที่ 3 ตาม door1/door2/door3 ที่มีในสคีมา)
function doorStates(probe: ProbeTelemetry): (boolean | null)[] {
  return [probe.door1, probe.door2, probe.door3].slice(0, Math.min(probe.doorQty, 3))
}

const DOOR_BADGE_TONE_CLASS: Record<Tone, string> = {
  success: 'border border-base-300 text-base-content/50',
  error: 'bg-error text-error-content',
  muted: 'border border-base-300 text-base-content/30',
}

// เวอร์ชัน badge สำหรับ card view — เปิด = badge สีแดงทึบ, ปิด/ไม่มีข้อมูล = outline
export function ProbeDoorBadges({ probe }: { probe: ProbeTelemetry }) {
  const states = doorStates(probe)
  if (states.length === 0) return null

  return (
    <span className="flex items-center gap-1.5">
      {states.map((open, index) => {
        const DoorIcon = open ? DoorOpen : DoorClosed
        return (
          <span
            key={index}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${DOOR_BADGE_TONE_CLASS[doorTone(open)]}`}
          >
            <DoorIcon
              className="h-4 w-4"
              aria-label={
                open === null
                  ? `ไม่มีข้อมูลประตู ${index + 1}`
                  : open
                    ? `ประตู ${index + 1} เปิดอยู่`
                    : `ประตู ${index + 1} ปิดสนิท`
              }
            />
          </span>
        )
      })}
    </span>
  )
}

export function ProbeDoorIcons({ probe }: { probe: ProbeTelemetry }) {
  return (
    <span className="flex items-center gap-1">
      {doorStates(probe).map((open, index) => {
        const DoorIcon = open ? DoorOpen : DoorClosed
        return (
          <DoorIcon
            key={index}
            className={`h-4 w-4 ${TONE_CLASS[doorTone(open)]}`}
            aria-label={
              open === null
                ? `ไม่มีข้อมูลประตู ${index + 1}`
                : open
                  ? `ประตู ${index + 1} เปิดอยู่`
                  : `ประตู ${index + 1} ปิดสนิท`
            }
          />
        )
      })}
    </span>
  )
}

// อุปกรณ์ออนไลน์แต่ probe นี้ไม่มีข้อมูล temp ล่าสุดส่งมา = probe มีปัญหาหรือหลุดการเชื่อมต่อ
// ถ้าอุปกรณ์ออฟไลน์อยู่แล้วไม่สามารถสรุปสถานะ probe ได้ ให้ถือเป็น muted แทนการฟันธงว่าหลุด
export function probeStatusTone(probe: ProbeTelemetry, online: boolean): Tone {
  const hasData = probe.tempDisplay !== null
  return !online ? 'muted' : hasData ? 'success' : 'error'
}

// สรุปสถานะ probe ทั้งหมดของอุปกรณ์เป็นสถานะเดียว — error มาก่อน (มี probe หลุด),
// รองลงมาคือ muted (ยังไม่ทราบสถานะเพราะออฟไลน์), ปกติหมดถึงจะเป็น success
export function aggregateProbeTone(
  probes: ProbeTelemetry[] | undefined,
  online: boolean,
): Tone {
  if (!probes || probes.length === 0) return 'muted'
  const tones = probes.map((probe) => probeStatusTone(probe, online))
  if (tones.includes('error')) return 'error'
  if (tones.includes('muted')) return 'muted'
  return 'success'
}

function probeStatusLabel(probe: ProbeTelemetry, online: boolean): string {
  const hasData = probe.tempDisplay !== null
  return !online
    ? 'ไม่ทราบสถานะ probe (อุปกรณ์ออฟไลน์)'
    : hasData
      ? 'probe เชื่อมต่อและส่งข้อมูลปกติ'
      : 'probe มีปัญหาหรือหลุดการเชื่อมต่อ'
}

// สีของ icon Thermometer สื่อสถานะ active ของ probe แทน (เขียว/แดง/เทา)
export function ProbeInfoLine({
  probe,
  online,
}: {
  probe: ProbeTelemetry
  online: boolean
}) {
  const tone = probeStatusTone(probe, online)

  return (
    <div className="flex h-5 items-center gap-2 text-sm">
      <Thermometer
        className={`h-4 w-4 shrink-0 ${TONE_CLASS[tone]}`}
        aria-label={probeStatusLabel(probe, online)}
      />
      <span className="min-w-0 truncate">
        <span className="text-base-content/40">CH{probe.channel}</span>{' '}
        {probe.name ?? `Probe ${probe.channel}`}
        {probe.type && <span className="ml-1 text-base-content/40">({probe.type})</span>}
      </span>
    </div>
  )
}

export function ProbeTempHumiLine({ probe }: { probe: ProbeTelemetry }) {
  return (
    <div className="flex h-5 items-center tabular-nums">
      {probe.tempDisplay !== null ? `${probe.tempDisplay}°C` : '—'}
      {' / '}
      {probe.humidityDisplay !== null ? `${probe.humidityDisplay}%` : '—'}
    </div>
  )
}
