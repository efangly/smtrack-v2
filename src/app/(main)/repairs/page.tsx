import { Suspense } from 'react'

import { Card } from '@/components/ui/Card'
import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { RepairAggregateList } from '@/components/features/repairs/RepairAggregateList'

export default function RepairsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">แจ้งซ่อม</h1>

      <SettingsGuard permission="repairs">
        <Card title="รายการแจ้งซ่อมทั้งหมด">
          <Suspense
            fallback={<span className="loading loading-spinner loading-md" />}
          >
            <RepairAggregateList />
          </Suspense>
        </Card>
      </SettingsGuard>
    </div>
  )
}
