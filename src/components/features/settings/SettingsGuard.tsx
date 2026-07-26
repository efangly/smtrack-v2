'use client'

import type { ReactNode } from 'react'

import { useHydrated } from '@/hooks/useHydrated'
import {
  canManageDevices,
  canManageHospitals,
  canManageUsers,
  canManageWards,
} from '@/lib/permissions'
import { useAuthStore } from '@/store/useAuthStore'
import type { Role } from '@/types/auth'

// รับเป็น key แทน predicate เพราะหน้าที่เรียกใช้เป็น Server Component
// ซึ่งส่ง function ข้ามไปยัง Client Component ไม่ได้
const CHECKS: Record<string, (role: Role | undefined | null) => boolean> = {
  users: canManageUsers,
  wards: canManageWards,
  hospitals: canManageHospitals,
  devices: canManageDevices,
}

export type SettingsPermission = keyof typeof CHECKS

/**
 * กันหน้าตั้งค่าตาม role ฝั่ง client — `src/proxy.ts` เช็คแค่ว่ามี token cookie
 * ไม่ได้เช็ค role จึงต้องกันอีกชั้นที่นี่ (backend มี RolesGuard เป็นด่านจริงอยู่แล้ว)
 */
export function SettingsGuard({
  permission,
  children,
}: {
  permission: SettingsPermission
  children: ReactNode
}) {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)

  if (!hydrated) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  if (!CHECKS[permission](role)) {
    return (
      <div className="alert alert-warning">
        <span>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</span>
      </div>
    )
  }

  return <>{children}</>
}
