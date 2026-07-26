'use client'

import { useQuery } from '@tanstack/react-query'

import { getWards } from '@/lib/api/wards'

// วอร์ดเป็น master data ที่แทบไม่เปลี่ยน และถูกใช้เป็นตัวเลือกใน dropdown หลายที่
// จึงตั้ง staleTime ยาวกว่า default (10 วินาที) เพื่อไม่ยิงซ้ำทุกครั้งที่เปิด dialog
export function useWards(enabled = true) {
  return useQuery({
    queryKey: ['wards'],
    queryFn: getWards,
    enabled,
    staleTime: 5 * 60_000,
  })
}
