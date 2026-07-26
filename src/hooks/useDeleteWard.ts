'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { deleteWard } from '@/lib/api/wards'
import { ApiError } from '@/lib/apiClient'

export function useDeleteWard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWard(id),
    onSuccess: () => {
      toast.success('ลบวอร์ดสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['wards'] })
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'ลบวอร์ดไม่สำเร็จ')
    },
  })
}
