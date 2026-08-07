import type { Metadata } from 'next'
import { Suspense } from 'react'

import { HospitalList } from '@/components/features/settings/HospitalList'
import { SettingsGuard } from '@/components/features/settings/SettingsGuard'

export const metadata: Metadata = { title: 'โรงพยาบาล | SMtrack' }

export default function SettingsHospitalsPage() {
  return (
    <SettingsGuard permission="hospitals">
      <Suspense fallback={<span className="loading loading-spinner loading-md" />}>
        <HospitalList />
      </Suspense>
    </SettingsGuard>
  )
}
