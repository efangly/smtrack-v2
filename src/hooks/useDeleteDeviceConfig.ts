'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { deleteDeviceConfig } from '@/lib/api/deviceConfig'
import { ApiError } from '@/lib/apiClient'

export function useDeleteDeviceConfig(deviceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteDeviceConfig(deviceId),
    onSuccess: () => {
      toast.success('ลบการตั้งค่าอุปกรณ์สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['devices', deviceId, 'config'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'ลบการตั้งค่าไม่สำเร็จ',
      )
    },
  })
}
