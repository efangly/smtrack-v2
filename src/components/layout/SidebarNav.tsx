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
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.can || (hydrated && item.can(role)),
  )
  const settingsChildren = (SETTINGS_ITEM.children ?? []).filter(
    (child) => !child.can || (hydrated && child.can(role)),
  )

  return (
    <ul className="menu w-full gap-1 px-3 py-2 text-lg">
      <li className="menu-title text-sm tracking-wide uppercase">เมนูหลัก</li>

      {visibleNavItems.map((item) => {
        const Icon = item.icon
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`gap-3 rounded-lg border-l-2 font-medium transition-colors ${
                isActive(item.href)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent hover:bg-base-200'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        )
      })}

      <div className="divider my-1" />

      <li>
        <details open={isActive(SETTINGS_ITEM.href)}>
          <summary
            className={`gap-3 rounded-lg font-medium ${
              isActive(SETTINGS_ITEM.href) ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <SettingsIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{SETTINGS_ITEM.label}</span>
          </summary>
          <ul className="text-base">
            {settingsChildren.map((child) => {
              const ChildIcon = child.icon
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className={`gap-3 rounded-lg border-l-2 transition-colors ${
                      pathname === child.href
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-transparent hover:bg-base-200'
                    }`}
                  >
                    <ChildIcon
                      className="h-5 w-5 shrink-0"
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
