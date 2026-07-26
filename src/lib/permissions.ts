import type { Role } from '@/types/auth'

const DEVICE_MANAGE_ROLES: Role[] = ['SUPER', 'SERVICE', 'ADMIN']

// สิทธิ์ด้านล่างสะท้อน RolesGuard ของ smtrack-authentication
// (internal/adapters/driving/http/router.go) — ถ้าฝั่ง service แก้ ต้องแก้ที่นี่ด้วย
// ไม่งั้นผู้ใช้จะเห็นปุ่มที่กดแล้วได้ 403 กลับมา
const USER_MANAGE_ROLES: Role[] = ['SUPER', 'SERVICE', 'ADMIN', 'LEGACY_ADMIN']
const MASTER_DATA_ROLES: Role[] = ['SUPER', 'SERVICE']

function hasRole(role: Role | undefined | null, allowed: Role[]): boolean {
  return !!role && allowed.includes(role)
}

export function canManageDevices(role: Role | undefined | null): boolean {
  return hasRole(role, DEVICE_MANAGE_ROLES)
}

export function canManageUsers(role: Role | undefined | null): boolean {
  return hasRole(role, USER_MANAGE_ROLES)
}

// backend ไม่ได้ใส่ guard ที่ PUT/DELETE /ward แต่ล็อกที่ POST — UI คุมทั้งชุด
// ให้เท่ากับสิทธิ์สร้าง เพื่อไม่ให้แก้ข้อมูล master data ได้กว้างกว่าที่ควร
export function canManageWards(role: Role | undefined | null): boolean {
  return hasRole(role, MASTER_DATA_ROLES)
}

export function canManageHospitals(role: Role | undefined | null): boolean {
  return hasRole(role, MASTER_DATA_ROLES)
}

/** ลบโรงพยาบาลเป็นสิทธิ์ของ SUPER เท่านั้น (แคบกว่าการแก้ไข) */
export function canDeleteHospital(role: Role | undefined | null): boolean {
  return role === 'SUPER'
}
