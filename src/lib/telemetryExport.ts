import type { LogDay } from '@/lib/api/telemetry'

import { downloadBlob } from './chartExport'

interface TelemetryExportMeta {
  deviceSerial: string
  deviceName?: string | null
  probeName?: string | null
  tempMin?: number | null
  tempMax?: number | null
}

const EXPORT_COLUMNS = [
  { header: 'No', key: 'no' },
  { header: 'DeviceSN', key: 'deviceSn' },
  { header: 'DeviceName', key: 'deviceName' },
  { header: 'ProbeName', key: 'probeName' },
  { header: 'TemperatureMin', key: 'temperatureMin' },
  { header: 'TemperatureMax', key: 'temperatureMax' },
  { header: 'Date', key: 'date' },
  { header: 'Time', key: 'time' },
  { header: 'Temperature', key: 'temperature' },
  { header: 'Humidity', key: 'humidity' },
  { header: 'Door1', key: 'door1' },
  { header: 'Door2', key: 'door2' },
  { header: 'Door3', key: 'door3' },
  { header: 'Plug', key: 'plug' },
  { header: 'Battery', key: 'battery' },
]

export async function exportTelemetryAsXlsx(
  rows: LogDay[],
  meta: TelemetryExportMeta,
  filename: string,
) {
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Telemetry')
  worksheet.columns = EXPORT_COLUMNS

  // useTelemetry ส่งข้อมูลใหม่สุดมาก่อน (เหมือนที่ TelemetryTable ใช้) ต้องกลับลำดับ
  // ให้เก่า→ใหม่ ก่อน export เพื่อให้คอลัมน์ No ไล่ตามเวลาเหมือนไฟล์ตัวอย่าง
  const orderedRows = [...rows].reverse()

  orderedRows.forEach((row, index) => {
    const sendTime = new Date(row.sendTime)
    worksheet.addRow({
      no: index + 1,
      deviceSn: meta.deviceSerial,
      deviceName: meta.deviceName ?? '',
      probeName: meta.probeName ?? row.probe ?? '',
      temperatureMin: meta.tempMin ?? '',
      temperatureMax: meta.tempMax ?? '',
      date: sendTime.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      time: sendTime.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      temperature: row.tempDisplay.toFixed(2),
      humidity: row.humidityDisplay.toFixed(2),
      door1: row.door1 ? 'เปิด' : 'ปิด',
      door2: row.door2 ? 'เปิด' : 'ปิด',
      door3: row.door3 ? 'เปิด' : 'ปิด',
      plug: row.plug ? 'ปกติ' : 'ปลั๊กหลุด',
      battery: row.battery,
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `${filename}.xlsx`,
  )
}
