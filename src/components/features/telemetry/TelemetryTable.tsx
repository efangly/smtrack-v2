'use client'

import { useState } from 'react'

import { useTelemetry } from '@/hooks/useTelemetry'
import type { TelemetryRange } from '@/lib/api/telemetry'
import { exportTelemetryAsXlsx } from '@/lib/telemetryExport'
import { formatDateTime } from '@/lib/utils'

export function TelemetryTable({
  serial,
  deviceId,
  probeId,
  range,
  from,
  to,
  deviceName,
  probeName,
  tempMin,
  tempMax,
}: {
  // ใช้เฉพาะแสดงผล/export — คิวรีข้อมูลจริงผ่าน deviceId เพื่อให้ต่อเนื่องข้ามการสลับเครื่อง
  serial: string
  deviceId: string
  probeId?: string
  range?: TelemetryRange
  from?: string
  to?: string
  deviceName?: string | null
  probeName?: string | null
  tempMin?: number | null
  tempMax?: number | null
}) {
  const { data, isLoading, isError } = useTelemetry({
    deviceId,
    probeId,
    range,
    from,
    to,
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!data || data.length === 0) return
    setIsExporting(true)
    try {
      // ชื่อไฟล์มักมี "/" ปนอยู่ถ้าเอา deviceName มาตรงๆ (เช่นชื่อจุดติดตั้ง) — เบราว์เซอร์
      // จะดาวน์โหลดเงียบๆ ไม่สำเร็จถ้า download attribute มี "/" ตัด char พวกนี้ทิ้งก่อน
      const safeTitle = (deviceName ?? serial).replace(/[/\\?%*:|"<>]/g, '-')
      const probeSuffix = probeName ? `-${probeName.replace(/[/\\?%*:|"<>]/g, '-')}` : ''
      const filename = `telemetry-${safeTitle}${probeSuffix}-${new Date().toISOString().slice(0, 10)}`
      await exportTelemetryAsXlsx(
        data,
        { deviceSerial: serial, deviceName, probeName, tempMin, tempMax },
        filename,
      )
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError)
    return <p className="text-error">ไม่สามารถโหลดข้อมูล telemetry ได้</p>
  if (!data || data.length === 0)
    return <p className="text-base-content/60">ยังไม่มีข้อมูล</p>

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-sm"
          disabled={isExporting}
          onClick={handleExport}
        >
          {isExporting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            'Export .xlsx'
          )}
        </button>
      </div>
      <div className="max-h-96 overflow-x-auto overflow-y-auto scrollbar-slim">
        <table className="table table-zebra table-sm">
          <thead>
            <tr>
              <th>เวลา</th>
              <th>อุณหภูมิ</th>
              <th>ความชื้น</th>
              <th>แบตเตอรี่</th>
              <th>ประตู 1</th>
              <th>ประตู 2</th>
              <th>ประตู 3</th>
              <th>อินเทอร์เน็ต</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{formatDateTime(row.sendTime)}</td>
                <td>{row.tempDisplay.toFixed(1)}°C</td>
                <td>{row.humidityDisplay.toFixed(1)}%</td>
                <td>{row.battery}%</td>
                <td>{row.door1 ? 'เปิด' : 'ปิด'}</td>
                <td>{row.door2 ? 'เปิด' : 'ปิด'}</td>
                <td>{row.door3 ? 'เปิด' : 'ปิด'}</td>
                <td>{row.internet ? 'เชื่อมต่อ' : 'ขาดการเชื่อมต่อ'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
