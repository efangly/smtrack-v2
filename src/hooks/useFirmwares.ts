'use client'

import { useQuery } from '@tanstack/react-query'

import { getFirmwares } from '@/lib/api/firmware'
import type { PaginationQuery } from '@/lib/api/pagination'

// คลังเฟิร์มแวร์เป็น master data ที่แทบไม่เปลี่ยน จึงตั้ง staleTime ยาวกว่า
// default (10 วินาที) เพื่อไม่ยิงซ้ำทุกครั้งที่ focus หน้าต่างหรือเปิด dialog
export function useFirmwares(params: PaginationQuery = {}) {
  return useQuery({
    queryKey: ['firmware', params],
    queryFn: () => getFirmwares(params),
    staleTime: 5 * 60_000,
  })
}
