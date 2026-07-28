'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { deleteWarranty } from '@/lib/api/warranty'
import { ApiError } from '@/lib/apiClient'

export function useDeleteWarranty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWarranty(id),
    onSuccess: () => {
      toast.success('ลบรายการประกันสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['warranties'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'ลบรายการประกันไม่สำเร็จ',
      )
    },
  })
}
