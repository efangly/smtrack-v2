'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { deleteFirmware } from '@/lib/api/firmware'
import { ApiError } from '@/lib/apiClient'

export function useDeleteFirmware() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFirmware(id),
    onSuccess: () => {
      toast.success('ลบเฟิร์มแวร์สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['firmware'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'ลบเฟิร์มแวร์ไม่สำเร็จ',
      )
    },
  })
}
