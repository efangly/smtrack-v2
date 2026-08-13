'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { useHydrated } from '@/hooks/useHydrated'
import { useAuthStore } from '@/store/useAuthStore'

/**
 * กันหน้า login โชว์ค้างหลัง login สำเร็จแล้วกด back — `src/proxy.ts` เช็ค
 * cookie เฉพาะตอนมี navigation request จริง แต่การกลับมาแบบ bfcache ไม่มี
 * request ใหม่ proxy จึงไม่ได้รันซ้ำ ต้องกันอีกชั้นที่ client ทั้งตอน mount
 * ปกติ และตอนหน้าโดน restore แบบ bfcache (pageshow + persisted)
 *
 * เช็ค `exp` ของ token ประกอบ (ไม่ใช่แค่ว่ามี token) เพื่อกัน redirect loop
 * กับ `proxy.ts` ที่เช็ค cookie — ถ้า token ใน store หมดอายุไปแล้วแต่ยังค้างอยู่
 * (เช่น token เก่าก่อนแก้ cookie max-age ให้ตรงกับ exp) ต้อง logout() เคลียร์
 * ทิ้งแทนที่จะ replace('/') ไปเจอ proxy เด้งกลับมา `/login` วนไม่จบ
 */
function isTokenValid(token: string | null, exp: number | undefined): boolean {
  if (!token) return false
  if (exp === undefined) return true
  return exp * 1000 > Date.now()
}

export function LoginGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const hydrated = useHydrated()
  const token = useAuthStore((state) => state.token)
  const exp = useAuthStore((state) => state.payload?.exp)
  const logout = useAuthStore((state) => state.logout)
  const valid = isTokenValid(token, exp)

  useEffect(() => {
    if (!hydrated) return
    if (token && !valid) {
      logout()
      return
    }
    if (valid) {
      router.replace('/')
    }
  }, [hydrated, token, valid, logout, router])

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      const state = useAuthStore.getState()
      if (isTokenValid(state.token, state.payload?.exp)) {
        router.replace('/')
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [router])

  if (!hydrated || valid) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return <>{children}</>
}
