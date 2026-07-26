'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateWard, type WardInput } from '@/lib/api/wards'
import { ApiError } from '@/lib/apiClient'

export function useUpdateWard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<WardInput> }) =>
      updateWard(id, dto),
    onSuccess: () => {
      toast.success('บันทึกข้อมูลวอร์ดสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['wards'] })
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
      // ผู้ใช้แสดงชื่อวอร์ดจาก relation ที่ backend preload มา
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'บันทึกข้อมูลวอร์ดไม่สำเร็จ',
      )
    },
  })
}
