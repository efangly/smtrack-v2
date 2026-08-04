'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateFirmware, type UpdateFirmwareInput } from '@/lib/api/firmware'
import { ApiError } from '@/lib/apiClient'

export function useUpdateFirmware() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFirmwareInput }) =>
      updateFirmware(id, dto),
    onSuccess: () => {
      toast.success('บันทึกเฟิร์มแวร์สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['firmware'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'บันทึกเฟิร์มแวร์ไม่สำเร็จ',
      )
    },
  })
}
