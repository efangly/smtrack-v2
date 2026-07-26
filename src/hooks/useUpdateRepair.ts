'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateRepair, type UpdateRepairInput } from '@/lib/api/repairs'
import { ApiError } from '@/lib/apiClient'

export function useUpdateRepair(serial: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRepairInput }) =>
      updateRepair(id, dto),
    onSuccess: () => {
      toast.success('บันทึกใบซ่อมสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['repairs', serial] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'บันทึกใบซ่อมไม่สำเร็จ',
      )
    },
  })
}
