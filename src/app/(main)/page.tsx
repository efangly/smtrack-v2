import { Card } from '@/components/ui/Card'
import { DeviceList } from '@/components/features/devices/DeviceList'
import { DeviceStatsRow } from '@/components/features/devices/DeviceStatsRow'
import { NotificationFeedStatus } from '@/components/features/notifications/NotificationFeedStatus'
import { RecentNotificationsTicker } from '@/components/features/notifications/RecentNotificationsTicker'

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">ภาพรวมระบบ</h1>
        <p className="mt-1 text-sm text-base-content/60">
          สถานะอุปกรณ์และการแจ้งเตือนแบบเรียลไทม์
        </p>
      </div>

      <DeviceStatsRow />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="อุปกรณ์ทั้งหมด"
            description="ค้นหาและกรองตามสถานะการเชื่อมต่อ"
          >
            <DeviceList />
          </Card>
        </div>
        <div>
          <Card title="การแจ้งเตือนล่าสุด" action={<NotificationFeedStatus />}>
            <RecentNotificationsTicker />
          </Card>
        </div>
      </div>
    </div>
  )
}
