'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createRepair, type CreateRepairInput } from '@/lib/api/repairs'
import { ApiError } from '@/lib/apiClient'

export function useCreateRepair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateRepairInput) => createRepair(dto),
    onSuccess: () => {
      toast.success('แจ้งซ่อมสำเร็จ')
      // ครอบทั้ง cache ต่อ serial (['repairs', serial, ...]) และรายการรวม
      // (['repairs', 'all', ...]) เพราะ key เป็น prefix match
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'แจ้งซ่อมไม่สำเร็จ',
      )
    },
  })
}
