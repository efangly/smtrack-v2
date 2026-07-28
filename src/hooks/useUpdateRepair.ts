'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateRepair, type UpdateRepairInput } from '@/lib/api/repairs'
import { ApiError } from '@/lib/apiClient'

export function useUpdateRepair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRepairInput }) =>
      updateRepair(id, dto),
    onSuccess: () => {
      toast.success('บันทึกใบซ่อมสำเร็จ')
      // ครอบทั้ง cache ต่อ serial (['repairs', serial, ...]) และรายการรวม
      // (['repairs', 'all', ...]) เพราะ key เป็น prefix match
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'บันทึกใบซ่อมไม่สำเร็จ',
      )
    },
  })
}
