'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { Card } from '@/components/ui/Card'
import { useDevices } from '@/hooks/useDevices'

import { NotificationList } from './NotificationList'
import { NotificationLiveFeed } from './NotificationLiveFeed'

export function DeviceNotificationsPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: devices } = useDevices()

  const selectedSerial =
    searchParams.get('serial') ?? devices?.[0]?.serial ?? ''

  return (
    <div className="flex flex-col gap-6">
      <label className="form-control max-w-xs">
        <span className="label-text mb-1">เลือกอุปกรณ์</span>
        <select
          className="select select-bordered"
          value={selectedSerial}
          onChange={(event) => {
            const params = new URLSearchParams(searchParams)
            params.set('serial', event.target.value)
            router.push(`/notifications?${params.toString()}`)
          }}
        >
          {devices?.map((device) => (
            <option key={device.id} value={device.serial}>
              {device.serial} — {device.name ?? device.staticName}
            </option>
          ))}
        </select>
      </label>

      {selectedSerial && (
        <Card
          title="ประวัติการแจ้งเตือน"
          action={<NotificationLiveFeed serial={selectedSerial} />}
        >
          <NotificationList serial={selectedSerial} />
        </Card>
      )}
    </div>
  )
}
