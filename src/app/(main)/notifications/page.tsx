import { Suspense } from 'react'

import { DeviceNotificationsPanel } from '@/components/features/notifications/DeviceNotificationsPanel'

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">การแจ้งเตือน</h1>
      <Suspense
        fallback={<span className="loading loading-spinner loading-md" />}
      >
        <DeviceNotificationsPanel />
      </Suspense>
    </div>
  )
}
