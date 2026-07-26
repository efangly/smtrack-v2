import { Card } from '@/components/ui/Card'
import { DeviceList } from '@/components/features/devices/DeviceList'

export default function DevicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">อุปกรณ์</h1>

      <Card title="รายการอุปกรณ์ทั้งหมด">
        <DeviceList />
      </Card>
    </div>
  )
}
