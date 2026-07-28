'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateWarranty, type UpdateWarrantyInput } from '@/lib/api/warranty'
import { ApiError } from '@/lib/apiClient'

export function useUpdateWarranty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWarrantyInput }) =>
      updateWarranty(id, dto),
    onSuccess: () => {
      toast.success('บันทึกรายการประกันสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['warranties'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'บันทึกรายการประกันไม่สำเร็จ',
      )
    },
  })
}
