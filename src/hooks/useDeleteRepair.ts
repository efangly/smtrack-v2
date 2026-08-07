'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { deleteRepair } from '@/lib/api/repairs'
import { ApiError } from '@/lib/apiClient'

export function useDeleteRepair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRepair(id),
    onSuccess: () => {
      toast.success('ลบรายการแจ้งซ่อมสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'ลบรายการแจ้งซ่อมไม่สำเร็จ',
      )
    },
  })
}
