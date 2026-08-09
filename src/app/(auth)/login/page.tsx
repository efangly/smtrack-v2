import type { Metadata } from 'next'
import { Radio } from 'lucide-react'

import { LoginForm } from '@/components/features/auth/LoginForm'
import { LoginGuard } from '@/components/features/auth/LoginGuard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ | SMtrack Dashboard',
}

export default function LoginPage() {
  return (
    <LoginGuard>
      <div className="w-full max-w-md">
        <div className="card surface-card">
          <div className="card-body gap-5 p-6 md:p-8">
            {/* จอใหญ่มีแผงแบรนด์ด้านซ้ายอยู่แล้ว จึงโชว์ตราย่อเฉพาะจอเล็ก */}
            <div className="flex items-center gap-3 lg:hidden">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content">
                <Radio className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">SMtrack Dashboard</p>
                <p className="text-xs text-base-content/50">
                  IoT telemetry monitoring
                </p>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-semibold">เข้าสู่ระบบ</h1>
              <p className="mt-1 text-sm text-base-content/60">
                กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งานระบบ
              </p>
            </div>

            <LoginForm />
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-base-content/50">
          SMtrack · ระบบเฝ้าระวังอุณหภูมิตู้แช่เย็น
        </p>
      </div>
    </LoginGuard>
  )
}
