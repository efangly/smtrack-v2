'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

function clampPage(raw: string | null): number {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

function clampLimit(raw: string | null, fallback: number): number {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1
    ? Math.min(Math.floor(n), MAX_LIMIT)
    : fallback
}

export interface UsePaginationParamsOptions {
  defaultLimit?: number
}

// namespace แยก page/limit ของแต่ละ list ที่อยู่ในหน้าเดียวกัน (เช่น
// devices/[serial] ที่มี ProbeList/RepairList/DeviceAuditTable/NotificationList
// พร้อมกัน) ไม่งั้นเปลี่ยนหน้าของ list หนึ่งจะไปทับ query param ของอีก list
export function usePaginationParams(
  namespace?: string,
  { defaultLimit = DEFAULT_LIMIT }: UsePaginationParamsOptions = {},
) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageKey = namespace ? `${namespace}Page` : 'page'
  const limitKey = namespace ? `${namespace}Limit` : 'limit'

  const page = clampPage(searchParams.get(pageKey))
  const limit = clampLimit(searchParams.get(limitKey), defaultLimit)

  const update = useCallback(
    (next: { page?: number; limit?: number }) => {
      const params = new URLSearchParams(searchParams)
      const nextPage = next.page ?? page
      const nextLimit = next.limit ?? limit

      if (nextPage <= 1) {
        params.delete(pageKey)
      } else {
        params.set(pageKey, String(nextPage))
      }

      if (nextLimit === defaultLimit) {
        params.delete(limitKey)
      } else {
        params.set(limitKey, String(nextLimit))
      }

      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [
      searchParams,
      router,
      pathname,
      pageKey,
      limitKey,
      page,
      limit,
      defaultLimit,
    ],
  )

  const setPage = useCallback(
    (nextPage: number) => update({ page: nextPage }),
    [update],
  )
  // เปลี่ยนขนาดหน้าแล้วต้องกลับไปหน้า 1 เสมอ ไม่งั้น offset เดิมจะเลื่อนข้ามข้อมูลไป
  const setLimit = useCallback(
    (nextLimit: number) => update({ page: 1, limit: nextLimit }),
    [update],
  )

  return { page, limit, setPage, setLimit }
}
