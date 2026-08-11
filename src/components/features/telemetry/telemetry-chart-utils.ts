import type { LogDay } from '@/lib/api/telemetry'

export type ChartRow = LogDay & {
  doorOpen: number
  internetUp: number
}

export function toChartData(data: LogDay[]): ChartRow[] {
  // /telemetry ส่งข้อมูลใหม่สุดมาก่อน (เหมือนที่ TelemetryTable ใช้) ต้องกลับลำดับ
  // ให้เก่า→ใหม่ ก่อนเข้ากราฟเส้น ไม่งั้นแกนเวลาจะวิ่งย้อนกลับ
  return [...data].reverse().map((row) => ({
    ...row,
    doorOpen: row.door1 || row.door2 || row.door3 ? 1 : 0,
    internetUp: row.internet ? 1 : 0,
  }))
}

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const DESIRED_TICK_COUNT = 8

export interface AxisTickConfig {
  tickFormatter: (value: string) => string
  ticks: string[]
}

function hourTick(value: string) {
  return new Date(value).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

function dayHourTick(value: string) {
  return new Date(value).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function dayTick(value: string) {
  return new Date(value).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })
}

// สเกลรูปแบบ label และตำแหน่ง tick ตามช่วงเวลา/ปริมาณข้อมูลที่กำลังแสดงจริง (ไม่ใช่
// ตาม range enum ตรงๆ) เพราะ modal เต็มจอซูมเข้าไปดูช่วงย่อยได้ และ range=custom
// ผู้ใช้เลือก span เองไม่ตายตัว — ถ้าไม่จำกัดจำนวน tick ข้อมูลหลักพันจุดใน 7d/30d
// จะทำให้ label ทับกันจนอ่านไม่ออก
//
// เลือกตำแหน่ง tick โดยอิงเวลาให้ห่างเท่าๆ กันจริง (ไม่ใช้ index ล้วนๆ แบบ interval ของ
// recharts) เพราะข้อมูลมักกระจุกตัวอยู่บางช่วง (เช่น มีข้อมูลจริงแค่ 1-2 วันล่าสุดใน
// range 30 วัน) ถ้า skip ด้วย index เฉยๆ tick หลายอันจะตกอยู่ในวันเดียวกันซ้ำๆ
export function getAxisTickConfig(data: { sendTime: string }[]): AxisTickConfig {
  if (data.length === 0) return { tickFormatter: hourTick, ticks: [] }

  const first = new Date(data[0].sendTime).getTime()
  const last = new Date(data[data.length - 1].sendTime).getTime()
  const spanMs = Math.abs(last - first)

  const tickFormatter = spanMs > 3 * DAY_MS ? dayTick : spanMs > DAY_MS ? dayHourTick : hourTick

  if (data.length <= DESIRED_TICK_COUNT) {
    return { tickFormatter, ticks: data.map((row) => row.sendTime) }
  }

  const step = spanMs / (DESIRED_TICK_COUNT - 1)
  const ticks: string[] = []
  let lastLabel: string | undefined
  let dataIdx = 0
  for (let i = 0; i < DESIRED_TICK_COUNT; i++) {
    const targetTime = first + step * i
    while (
      dataIdx < data.length - 1 &&
      Math.abs(new Date(data[dataIdx + 1].sendTime).getTime() - targetTime) <=
        Math.abs(new Date(data[dataIdx].sendTime).getTime() - targetTime)
    ) {
      dataIdx++
    }
    const value = data[dataIdx].sendTime
    // dedupe ด้วย label ที่ format แล้ว ไม่ใช่ raw timestamp — สอง tick ที่ต่างเวลากัน
    // แต่ format ออกมาเป็นวันเดียวกัน (เช่น สเกลระดับวัน) ก็ถือว่าซ้ำ ต้องข้าม
    const label = tickFormatter(value)
    if (label !== lastLabel) {
      ticks.push(value)
      lastLabel = label
    }
  }

  return { tickFormatter, ticks }
}

export function doorTick(value: number) {
  return value ? 'เปิด' : 'ปิด'
}

export function internetTick(value: number) {
  return value ? 'เชื่อมต่อ' : 'ขาดการเชื่อมต่อ'
}
