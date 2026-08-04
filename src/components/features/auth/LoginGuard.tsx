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
 */
export function LoginGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const hydrated = useHydrated()
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (hydrated && token) {
      router.replace('/')
    }
  }, [hydrated, token, router])

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && useAuthStore.getState().token) {
        router.replace('/')
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [router])

  if (!hydrated || token) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return <>{children}</>
}
