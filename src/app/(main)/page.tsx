import { Card } from '@/components/ui/Card'
import { DeviceList } from '@/components/features/devices/DeviceList'
import { NotificationCategoryStatsRow } from '@/components/features/devices/NotificationCategoryStatsRow'

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6">

      <NotificationCategoryStatsRow />

      <Card
        title="อุปกรณ์ทั้งหมด"
        description="ค้นหาและกรองตามสถานะการเชื่อมต่อ"
      >
        <DeviceList />
      </Card>
    </div>
  )
}
