'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * false ตอน render บน server / ครั้งแรกบน client แล้วเป็น true หลัง hydrate
 * ใช้กับ UI ที่ค่าเริ่มต้นมาจาก localStorage (เช่น token) เพื่อกัน hydration mismatch
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
