import { Suspense } from 'react'

import { Card } from '@/components/ui/Card'
import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { WarrantyList } from '@/components/features/warranty/WarrantyList'

export default function WarrantyPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">จัดการประกัน</h1>

      <SettingsGuard permission="warranty">
        <Card title="รายการประกันอุปกรณ์ทั้งหมด">
          <Suspense
            fallback={<span className="loading loading-spinner loading-md" />}
          >
            <WarrantyList />
          </Suspense>
        </Card>
      </SettingsGuard>
    </div>
  )
}
