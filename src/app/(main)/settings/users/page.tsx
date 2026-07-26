import type { Metadata } from 'next'

import { SettingsGuard } from '@/components/features/settings/SettingsGuard'
import { UserList } from '@/components/features/settings/UserList'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'ผู้ใช้งาน | SMtrack' }

export default function SettingsUsersPage() {
  return (
    <SettingsGuard permission="users">
      <Card
        title="รายการผู้ใช้งานทั้งหมด"
        description="ขอบเขตข้อมูลที่เห็นถูกจำกัดตามสิทธิ์ของบัญชีที่ใช้งานอยู่"
      >
        <UserList />
      </Card>
    </SettingsGuard>
  )
}
