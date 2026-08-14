'use client'

import { useQuery } from '@tanstack/react-query'

import { getUsers } from '@/lib/api/users'

// ผู้ใช้เป็น master data ที่แทบไม่เปลี่ยน จึงตั้ง staleTime ยาวกว่า default
// (10 วินาที) เพื่อไม่ยิงซ้ำทุกครั้งที่ focus หน้าต่างหรือเปิด dialog
export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled,
    staleTime: 5 * 60_000,
  })
}
