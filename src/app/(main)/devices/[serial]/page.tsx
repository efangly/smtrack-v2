import { notFound } from 'next/navigation'

import { Card } from '@/components/ui/Card'
import { DeviceInfoCard } from '@/components/features/devices/DeviceInfoCard'
import { TelemetryGraph } from '@/components/features/telemetry/TelemetryGraph'
import { TelemetryTable } from '@/components/features/telemetry/TelemetryTable'
import { TelemetryLiveFeed } from '@/components/features/telemetry/TelemetryLiveFeed'
import { DailyRollupChart } from '@/components/features/logday/DailyRollupChart'
import { NotificationList } from '@/components/features/notifications/NotificationList'
import { NotificationLiveFeed } from '@/components/features/notifications/NotificationLiveFeed'
import { getDevice } from '@/lib/api/devices'
import { ApiError } from '@/lib/apiClient'

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ serial: string }>
}) {
  const { serial } = await params

  const device = await getDevice(serial).catch((error: unknown) => {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound()
    }
    throw error
  })

  return (
    <div className="flex flex-col gap-6">
      <DeviceInfoCard device={device} />

      <Card title="กราฟอุณหภูมิ/ความชื้น">
        <TelemetryGraph serial={serial} />
      </Card>

      <Card title="สรุปรายวัน">
        <DailyRollupChart serial={serial} />
      </Card>

      <Card
        title="ข้อมูล telemetry ล่าสุด"
        action={<TelemetryLiveFeed serial={serial} />}
      >
        <TelemetryTable serial={serial} />
      </Card>

      <Card
        title="การแจ้งเตือน"
        action={<NotificationLiveFeed serial={serial} />}
      >
        <NotificationList serial={serial} />
      </Card>
    </div>
  )
}
