import {
  Archive,
  Bell,
  Building2,
  Cpu,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
  type LucideIcon,
} from 'lucide-react'

import {
  canManageDevices,
  canManageHospitals,
  canManageUsers,
  canManageWards,
} from '@/lib/permissions'
import type { Role } from '@/types/auth'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** เมนูย่อยที่กางอยู่ใต้เมนูนี้ */
  children?: NavItem[]
  /** ถ้ากำหนดไว้ เมนูจะโชว์เฉพาะ role ที่ผ่านเงื่อนไข (ไม่กำหนด = ทุกคนเห็น) */
  can?: (role: Role | undefined | null) => boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/devices', label: 'อุปกรณ์', icon: Cpu },
  { href: '/notifications', label: 'การแจ้งเตือน', icon: Bell },
  { href: '/backup', label: 'Backup / Archive', icon: Archive },
]

export const SETTINGS_ITEM: NavItem = {
  href: '/settings',
  label: 'ตั้งค่า',
  icon: Settings,
  children: [
    { href: '/settings/account', label: 'บัญชีของฉัน', icon: UserCircle },
    {
      href: '/settings/users',
      label: 'ผู้ใช้งาน',
      icon: Users,
      can: canManageUsers,
    },
    {
      href: '/settings/wards',
      label: 'วอร์ด',
      icon: LayoutDashboard,
      can: canManageWards,
    },
    {
      href: '/settings/hospitals',
      label: 'โรงพยาบาล',
      icon: Building2,
      can: canManageHospitals,
    },
    {
      href: '/settings/devices',
      label: 'จัดการอุปกรณ์',
      icon: Cpu,
      can: canManageDevices,
    },
  ],
}

// รวมเมนูย่อยเข้าไปด้วย เพื่อให้ getNavItem หาชื่อหน้าของ /settings/* ได้ —
// การ match แบบ exact ถูกลองก่อน จึงไม่ถูก /settings ตัวแม่กลืนไป
const ALL_ITEMS = [
  ...NAV_ITEMS,
  SETTINGS_ITEM,
  ...(SETTINGS_ITEM.children ?? []),
]

/** ใช้ทำชื่อหน้าใน topbar — รองรับ path ย่อยอย่าง /devices/<serial> ด้วย */
export function getNavItem(pathname: string): NavItem | undefined {
  const exact = ALL_ITEMS.find((item) => item.href === pathname)
  if (exact) return exact
  return ALL_ITEMS.find(
    (item) => item.href !== '/' && pathname.startsWith(`${item.href}/`),
  )
}
