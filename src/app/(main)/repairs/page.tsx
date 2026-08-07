import { Suspense } from 'react'

import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { RepairAggregateList } from '@/components/features/repairs/RepairAggregateList'

export default function RepairsPage() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsGuard permission="repairs">
        <Suspense
          fallback={<span className="loading loading-spinner loading-md" />}
        >
          <RepairAggregateList />
        </Suspense>
      </SettingsGuard>
    </div>
  )
}
