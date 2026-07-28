'use client'

import { useTelemetry } from '@/hooks/useTelemetry'
import { formatDateTime } from '@/lib/utils'

export function TelemetryTable({ serial }: { serial: string }) {
  const { data, isLoading, isError } = useTelemetry({ serial, limit: 50 })

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError)
    return <p className="text-error">ไม่สามารถโหลดข้อมูล telemetry ได้</p>
  if (!data || data.length === 0)
    return <p className="text-base-content/60">ยังไม่มีข้อมูล</p>

  return (
    <div className="max-h-96 overflow-y-auto overflow-x-auto">
      <table className="table table-sm">
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
  )
}
