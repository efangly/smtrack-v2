'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useHydrated } from '@/hooks/useHydrated'
import { useAuthStore } from '@/store/useAuthStore'

import { NAV_ITEMS, SETTINGS_ITEM } from './navItems'

export function SidebarNav() {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const SettingsIcon = SETTINGS_ITEM.icon

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  // ก่อน hydrate ยังไม่รู้ role (token อ่านจาก localStorage) — โชว์เฉพาะเมนูที่ทุกคน
  // เห็นได้ ไม่งั้น markup ฝั่ง server กับ client จะไม่ตรงกัน
  const settingsChildren = (SETTINGS_ITEM.children ?? []).filter(
    (child) => !child.can || (hydrated && child.can(role)),
  )

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
        <details open={isActive(SETTINGS_ITEM.href)}>
          <summary className="gap-3 rounded-lg font-medium">
            <SettingsIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{SETTINGS_ITEM.label}</span>
          </summary>
          <ul>
            {settingsChildren.map((child) => {
              const ChildIcon = child.icon
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className={`gap-3 rounded-lg ${
                      pathname === child.href ? 'menu-active' : ''
                    }`}
                  >
                    <ChildIcon
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    {child.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </details>
      </li>
    </ul>
  )
}
