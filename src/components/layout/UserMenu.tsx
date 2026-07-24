'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

import { Dropdown } from '@/components/ui/Dropdown'
import { useHydrated } from '@/hooks/useHydrated'
import { useAuthStore } from '@/store/useAuthStore'

export function UserMenu() {
  const router = useRouter()
  const hydrated = useHydrated()
  const payload = useAuthStore((state) => state.payload)
  const logout = useAuthStore((state) => state.logout)

  const onLogout = () => {
    logout()
    router.push('/login')
  }

  if (!hydrated || !payload) return null

  return (
    <Dropdown
      ariaLabel="เมนูผู้ใช้"
      trigger={<User className="h-4 w-4" aria-hidden="true" />}
      panelClassName="w-56 p-2"
    >
      {(close) => (
        <div className="flex flex-col gap-2">
          <div className="px-2 py-1 text-sm">
            <p className="truncate font-semibold">{payload.name}</p>
            <p className="text-base-content/60">{payload.role}</p>
          </div>
          <div className="divider my-0" />
          <button
            type="button"
            className="btn btn-ghost btn-sm justify-start gap-2"
            onClick={() => {
              close()
              onLogout()
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            ออกจากระบบ
          </button>
        </div>
      )}
    </Dropdown>
  )
}
