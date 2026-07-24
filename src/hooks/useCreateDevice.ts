'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createDevice, type CreateDeviceInput } from '@/lib/api/devices'
import { ApiError } from '@/lib/apiClient'

export function useCreateDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateDeviceInput) => createDevice(dto),
    onSuccess: () => {
      toast.success('สร้างอุปกรณ์สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'สร้างอุปกรณ์ไม่สำเร็จ',
      )
    },
  })
}
