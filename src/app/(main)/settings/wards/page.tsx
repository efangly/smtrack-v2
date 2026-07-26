import type { Metadata } from 'next'

import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { WardList } from '@/components/features/settings/WardList'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'วอร์ด | SMtrack' }

export default function SettingsWardsPage() {
  return (
    <SettingsGuard permission="wards">
      <Card title="รายการวอร์ดทั้งหมด">
        <WardList />
      </Card>
    </SettingsGuard>
  )
}
