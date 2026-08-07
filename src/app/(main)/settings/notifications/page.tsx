import type { Metadata } from 'next'

import { NotificationSoundSettingsCard } from '@/components/features/settings/NotificationSoundSettingsCard'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'เสียงแจ้งเตือน | SMtrack' }

export default function SettingsNotificationsPage() {
  return (
    <Card
      title="เสียงแจ้งเตือน"
      description="เลือกเสียงที่จะเล่นเมื่อมีการแจ้งเตือนใหม่เข้ามา"
    >
      <NotificationSoundSettingsCard />
    </Card>
  )
}
