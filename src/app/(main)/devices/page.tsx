import { Suspense } from 'react'

import { Card } from '@/components/ui/Card'
import { DeviceList } from '@/components/features/devices/DeviceList'

export default function DevicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card title="รายการอุปกรณ์ทั้งหมด">
        <Suspense fallback={<span className="loading loading-spinner loading-md" />}>
          <DeviceList />
        </Suspense>
      </Card>
    </div>
  )
}
