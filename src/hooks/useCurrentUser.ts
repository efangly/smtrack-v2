'use client'

import { useHydrated } from '@/hooks/useHydrated'
import { useUser } from '@/hooks/useUser'
import { useAuthStore } from '@/store/useAuthStore'

/**
 * ข้อมูลผู้ใช้ที่ล็อกอินอยู่ — JWT มีแค่ id/ward id จึงต้องดึงรายละเอียด (ชื่อวอร์ด,
 * โรงพยาบาล, รูป) จาก GET /user/:id ซึ่ง preload ward.hospital มาให้ด้วย
 *
 * id อ่านจาก token ใน localStorage จึงต้องรอ hydrate ก่อน ไม่งั้น markup ฝั่ง server
 * กับ client จะไม่ตรงกัน
 */
export function useCurrentUser() {
  const hydrated = useHydrated()
  const payload = useAuthStore((state) => state.payload)
  const query = useUser(hydrated ? (payload?.id ?? '') : '')

  return { ...query, payload, hydrated }
}
