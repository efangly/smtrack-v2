import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { UserList } from '@/components/features/settings/UserList'

export const metadata: Metadata = { title: 'ผู้ใช้งาน | SMtrack' }

export default function SettingsUsersPage() {
  return (
    <SettingsGuard permission="users">
      <Suspense fallback={<span className="loading loading-spinner loading-md" />}>
        <UserList />
      </Suspense>
    </SettingsGuard>
  )
}
