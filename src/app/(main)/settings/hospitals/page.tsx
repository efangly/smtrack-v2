import type { Metadata } from 'next'

import { HospitalList } from '@/components/features/settings/HospitalList'
import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'โรงพยาบาล | SMtrack' }

export default function SettingsHospitalsPage() {
  return (
    <SettingsGuard permission="hospitals">
      <Card title="รายการโรงพยาบาลทั้งหมด">
        <HospitalList />
      </Card>
    </SettingsGuard>
  )
}
