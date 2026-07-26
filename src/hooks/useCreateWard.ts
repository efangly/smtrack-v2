'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createWard, type WardInput } from '@/lib/api/wards'
import { ApiError } from '@/lib/apiClient'

export function useCreateWard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: WardInput) => createWard(dto),
    onSuccess: () => {
      toast.success('เพิ่มวอร์ดสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['wards'] })
      // โรงพยาบาลฝังรายการวอร์ดมาด้วย (และ backend ก็ล้าง cache ฝั่งตัวเองเหมือนกัน)
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'เพิ่มวอร์ดไม่สำเร็จ')
    },
  })
}
