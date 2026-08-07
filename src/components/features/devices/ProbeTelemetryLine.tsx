'use client'

import { Cable, DoorClosed, DoorOpen, Thermometer, Unplug } from 'lucide-react'

import type { ProbeTelemetry } from '@/lib/api/probes'

type Tone = 'success' | 'error' | 'muted'

const TONE_CLASS: Record<Tone, string> = {
  success: 'text-success',
  error: 'text-error',
  muted: 'text-base-content/30',
}

function doorTone(open: boolean | null): Tone {
  if (open === null) return 'muted'
  return open ? 'error' : 'success'
}

// จำนวนไอคอนประตูต่อ probe อิงจาก doorQty จริง (ตัดที่ 3 ตาม door1/door2/door3 ที่มีในสคีมา)
function doorStates(probe: ProbeTelemetry): (boolean | null)[] {
  return [probe.door1, probe.door2, probe.door3].slice(0, Math.min(probe.doorQty, 3))
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
function probeStatusTone(probe: ProbeTelemetry, online: boolean): Tone {
  const hasData = probe.tempDisplay !== null
  return !online ? 'muted' : hasData ? 'success' : 'error'
}

function probeStatusLabel(probe: ProbeTelemetry, online: boolean): string {
  const hasData = probe.tempDisplay !== null
  return !online
    ? 'ไม่ทราบสถานะ probe (อุปกรณ์ออฟไลน์)'
    : hasData
      ? 'probe เชื่อมต่อและส่งข้อมูลปกติ'
      : 'probe มีปัญหาหรือหลุดการเชื่อมต่อ'
}

export function ProbeStatusIcon({
  probe,
  online,
}: {
  probe: ProbeTelemetry
  online: boolean
}) {
  const tone = probeStatusTone(probe, online)
  const StatusIcon = tone === 'error' ? Unplug : Cable

  return (
    <StatusIcon
      className={`h-4 w-4 ${TONE_CLASS[tone]}`}
      aria-label={probeStatusLabel(probe, online)}
    />
  )
}

// สีของ icon Thermometer สื่อสถานะ active ของ probe แทน (เขียว/แดง/เทา) — ไม่ต้องมี
// ProbeStatusIcon (Cable/Unplug) แยกอยู่ข้าง ๆ wifi/battery อีกคอลัมน์
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

export function ProbeTelemetryLine({
  probe,
  showLabel,
  online,
}: {
  probe: ProbeTelemetry
  showLabel: boolean
  online: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {showLabel && (
        <span className="min-w-0 truncate text-xs font-medium text-base-content/60">
          {probe.name ?? `Probe ${probe.channel}`}
          <span className="ml-1 text-base-content/40">CH{probe.channel}</span>
        </span>
      )}
      <ProbeStatusIcon probe={probe} online={online} />
      <span className="tabular-nums">
        {probe.tempDisplay !== null ? `${probe.tempDisplay}°C` : '—'}
      </span>
      <span className="tabular-nums text-base-content/70">
        {probe.humidityDisplay !== null ? `${probe.humidityDisplay}%` : '—'}
      </span>
      <ProbeDoorIcons probe={probe} />
    </div>
  )
}
