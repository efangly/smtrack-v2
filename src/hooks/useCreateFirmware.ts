'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createFirmware, type CreateFirmwareInput } from '@/lib/api/firmware'
import { ApiError } from '@/lib/apiClient'

export function useCreateFirmware() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateFirmwareInput) => createFirmware(dto),
    onSuccess: () => {
      toast.success('อัปโหลดเฟิร์มแวร์สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['firmware'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'อัปโหลดเฟิร์มแวร์ไม่สำเร็จ',
      )
    },
  })
}
