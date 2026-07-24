'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { KeyRound, Menu } from 'lucide-react'

import { NotificationBell } from '@/components/features/notifications/NotificationBell'
import { useHydrated } from '@/hooks/useHydrated'
import { useAuthStore } from '@/store/useAuthStore'

import { getNavItem } from './navItems'
import { ThemeToggle } from './ThemeToggle'

function getPageTitle(pathname: string): string {
  const item = getNavItem(pathname)
  if (item) return item.label
  if (pathname.startsWith('/devices/')) return 'รายละเอียดอุปกรณ์'
  return 'SMtrack'
}

export function Topbar() {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const storedToken = useAuthStore((state) => state.token)
  const token = hydrated ? storedToken : null
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/85 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-3 md:px-6">
        <label
          htmlFor="main-drawer"
          role="button"
          className="btn btn-square btn-ghost btn-sm lg:hidden"
          aria-label="เปิดเมนู"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </label>

        {/* ชื่อหน้าเป็น span ไม่ใช่ heading เพื่อไม่ให้ชนกับ <h1> ของแต่ละหน้า */}
        <nav aria-label="breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-2 text-sm">
            <li className="hidden text-base-content/50 sm:block">SMtrack</li>
            <li className="hidden text-base-content/30 sm:block">/</li>
            <li className="min-w-0">
              <span className="block truncate font-semibold">{title}</span>
            </li>
          </ol>
        </nav>

        <Link
          href="/settings"
          className={`btn btn-ghost btn-xs hidden gap-1.5 sm:inline-flex ${
            token ? 'text-success' : 'text-base-content/50'
          }`}
          title={token ? 'ตั้งค่า token แล้ว' : 'ยังไม่ได้ตั้งค่า token'}
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
          {token ? 'Token พร้อมใช้' : 'ตั้งค่า token'}
        </Link>

        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  )
}
