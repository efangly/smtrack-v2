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

export function timeTick(value: string) {
  return new Date(value).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function doorTick(value: number) {
  return value ? 'เปิด' : 'ปิด'
}

export function internetTick(value: number) {
  return value ? 'เชื่อมต่อ' : 'ขาดการเชื่อมต่อ'
}
