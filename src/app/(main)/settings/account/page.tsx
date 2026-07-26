import type { Metadata } from 'next'

import { AccountCard } from '@/components/features/settings/AccountCard'
import { AuthServiceStatusCard } from '@/components/features/settings/AuthServiceStatusCard'
import { ChangePasswordForm } from '@/components/features/settings/ChangePasswordForm'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'บัญชีของฉัน | SMtrack' }

export default function SettingsAccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card title="บัญชีผู้ใช้">
        <AccountCard />
      </Card>
      <Card
        title="เปลี่ยนรหัสผ่าน"
        description="ต้องยืนยันด้วยรหัสผ่านเดิมก่อนตั้งรหัสใหม่"
      >
        <ChangePasswordForm />
      </Card>
      <Card title="สถานะบริการยืนยันตัวตน">
        <AuthServiceStatusCard />
      </Card>
    </div>
  )
}
