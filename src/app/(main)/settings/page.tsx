import { Card } from '@/components/ui/Card'
import { TokenSettingsForm } from '@/components/features/auth/TokenSettingsForm'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">ตั้งค่า</h1>
      <Card title="Authorization Token">
        <TokenSettingsForm />
      </Card>
    </div>
  )
}
