'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Badge } from '@/components/ui/Badge'
import { useHydrated } from '@/hooks/useHydrated'
import { useAuthStore } from '@/store/useAuthStore'

import { NAV_ITEMS, SETTINGS_ITEM } from './navItems'

export function SidebarNav() {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const storedToken = useAuthStore((state) => state.token)
  // ค่าเริ่มต้นมาจาก localStorage จึงต้องรอ mount ก่อน ไม่งั้น hydration ไม่ตรงกับ server
  const token = hydrated ? storedToken : null
  const SettingsIcon = SETTINGS_ITEM.icon

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <ul className="menu w-full gap-1 px-3 py-2">
      <li className="menu-title text-xs tracking-wide uppercase">เมนูหลัก</li>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`gap-3 rounded-lg font-medium ${
                isActive(item.href) ? 'menu-active' : ''
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        )
      })}

      <div className="divider my-1" />

      <li>
        <Link
          href={SETTINGS_ITEM.href}
          className={`gap-3 rounded-lg font-medium ${
            pathname === SETTINGS_ITEM.href ? 'menu-active' : ''
          }`}
        >
          <SettingsIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{SETTINGS_ITEM.label}</span>
          <Badge tone={token ? 'success' : 'warning'}>
            {token ? 'Token พร้อม' : 'ยังไม่ตั้งค่า'}
          </Badge>
        </Link>
      </li>
    </ul>
  )
}
