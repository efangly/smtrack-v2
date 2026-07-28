'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createWarranty, type CreateWarrantyInput } from '@/lib/api/warranty'
import { ApiError } from '@/lib/apiClient'

export function useCreateWarranty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateWarrantyInput) => createWarranty(dto),
    onSuccess: () => {
      toast.success('เพิ่มรายการประกันสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['warranties'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'เพิ่มรายการประกันไม่สำเร็จ',
      )
    },
  })
}
