'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { Card } from '@/components/ui/Card'
import { useDevices } from '@/hooks/useDevices'
import {
  NOTIFICATION_FILTERS,
  type NotificationFilterValue,
} from '@/lib/notificationType'

import { AllNotificationsList } from './AllNotificationsList'
import { NotificationList } from './NotificationList'
import { NotificationLiveFeed } from './NotificationLiveFeed'

// serial ว่าง = ดูการแจ้งเตือนของทุกอุปกรณ์ (ผ่าน GET /notifications ซึ่งไม่รับ
// serial แต่ scope ตาม ward ของ user เอง) — ตั้งเป็นค่าเริ่มต้นแทนอุปกรณ์แรก
const ALL_DEVICES = ''
const DEFAULT_FILTER: NotificationFilterValue = 'all'

export function DeviceNotificationsPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: devices } = useDevices()

  const selectedSerial = searchParams.get('serial') ?? ALL_DEVICES
  const selectedFilter = (searchParams.get('type') ??
    DEFAULT_FILTER) as NotificationFilterValue
  const activeFilter = NOTIFICATION_FILTERS.find(
    (f) => f.value === selectedFilter,
  )
  const queryFilter =
    selectedFilter === 'all'
      ? undefined
      : (activeFilter?.queryValue ?? selectedFilter)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/notifications?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="form-control max-w-xs">
          <span className="label-text mb-1">เลือกอุปกรณ์</span>
          <select
            className="select select-bordered"
            value={selectedSerial}
            onChange={(event) => updateParam('serial', event.target.value)}
          >
            <option value={ALL_DEVICES}>ทุกอุปกรณ์ (ALL)</option>
            {devices
              ?.filter(
                (device): device is typeof device & { serial: string } =>
                  device.serial !== null,
              )
              .map((device) => (
                <option key={device.id} value={device.serial}>
                  {device.serial} — {device.name ?? '-'}
                </option>
              ))}
          </select>
        </label>

        <div role="group" aria-label="กรองตามประเภท" className="join flex-wrap">
          {NOTIFICATION_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`btn join-item btn-sm gap-1.5 ${
                selectedFilter === item.value ? 'btn-active btn-primary' : ''
              }`}
              aria-pressed={selectedFilter === item.value}
              onClick={() => updateParam('type', item.value)}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <Card
        title="ประวัติการแจ้งเตือน"
        action={
          selectedSerial ? <NotificationLiveFeed serial={selectedSerial} /> : undefined
        }
      >
        {selectedSerial === ALL_DEVICES ? (
          <AllNotificationsList filter={queryFilter} />
        ) : (
          <NotificationList
            serial={selectedSerial}
            filter={selectedFilter === 'all' ? undefined : selectedFilter}
          />
        )}
      </Card>
    </div>
  )
}
