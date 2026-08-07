import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { WardList } from '@/components/features/settings/WardList'

export const metadata: Metadata = { title: 'วอร์ด | SMtrack' }

export default function SettingsWardsPage() {
  return (
    <SettingsGuard permission="wards">
      <Suspense fallback={<span className="loading loading-spinner loading-md" />}>
        <WardList />
      </Suspense>
    </SettingsGuard>
  )
}
