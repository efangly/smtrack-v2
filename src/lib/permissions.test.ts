import {
  canDeleteHospital,
  canManageDevices,
  canManageHospitals,
  canManageUsers,
  canManageWards,
} from './permissions'
import { ROLE_OPTIONS, type Role } from '@/types/auth'

// ตารางนี้ต้องตรงกับ RolesGuard ใน smtrack-authentication
// (internal/adapters/driving/http/router.go) — ถือเป็นสัญญาระหว่างสอง repo
const EXPECTED: Record<
  string,
  { fn: (role: Role | undefined | null) => boolean; allowed: Role[] }
> = {
  canManageUsers: {
    fn: canManageUsers,
    allowed: ['SUPER', 'SERVICE', 'ADMIN', 'LEGACY_ADMIN'],
  },
  canManageWards: { fn: canManageWards, allowed: ['SUPER', 'SERVICE'] },
  canManageHospitals: {
    fn: canManageHospitals,
    allowed: ['SUPER', 'SERVICE'],
  },
  canDeleteHospital: { fn: canDeleteHospital, allowed: ['SUPER'] },
  canManageDevices: {
    fn: canManageDevices,
    allowed: ['SUPER', 'SERVICE', 'ADMIN'],
  },
}

describe('permissions', () => {
  it.each(Object.entries(EXPECTED))(
    '%s allows exactly the expected roles',
    (_name, { fn, allowed }) => {
      for (const role of ROLE_OPTIONS) {
        expect(fn(role)).toBe(allowed.includes(role))
      }
    },
  )

  it.each(Object.entries(EXPECTED))(
    '%s denies a missing role',
    (_name, { fn }) => {
      expect(fn(undefined)).toBe(false)
      expect(fn(null)).toBe(false)
    },
  )
})
