import {
  Archive,
  Bell,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/notifications', label: 'การแจ้งเตือน', icon: Bell },
  { href: '/backup', label: 'Backup / Archive', icon: Archive },
]

export const SETTINGS_ITEM: NavItem = {
  href: '/settings',
  label: 'ตั้งค่า',
  icon: Settings,
}

const ALL_ITEMS = [...NAV_ITEMS, SETTINGS_ITEM]

/** ใช้ทำชื่อหน้าใน topbar — รองรับ path ย่อยอย่าง /devices/<serial> ด้วย */
export function getNavItem(pathname: string): NavItem | undefined {
  const exact = ALL_ITEMS.find((item) => item.href === pathname)
  if (exact) return exact
  return ALL_ITEMS.find(
    (item) => item.href !== '/' && pathname.startsWith(`${item.href}/`),
  )
}
