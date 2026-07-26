'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createRepair, type CreateRepairInput } from '@/lib/api/repairs'
import { ApiError } from '@/lib/apiClient'

export function useCreateRepair(serial: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateRepairInput) => createRepair(dto),
    onSuccess: () => {
      toast.success('แจ้งซ่อมสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['repairs', serial] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'แจ้งซ่อมไม่สำเร็จ',
      )
    },
  })
}
