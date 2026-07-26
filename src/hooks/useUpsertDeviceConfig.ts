'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import {
  createDeviceConfig,
  updateDeviceConfig,
  type DeviceConfigInput,
} from '@/lib/api/deviceConfig'
import { ApiError } from '@/lib/apiClient'

export function useUpsertDeviceConfig(deviceId: string, exists: boolean) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: DeviceConfigInput) =>
      exists
        ? updateDeviceConfig(deviceId, dto)
        : createDeviceConfig(deviceId, dto),
    onSuccess: () => {
      toast.success('บันทึกการตั้งค่าอุปกรณ์สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['devices', deviceId, 'config'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'บันทึกการตั้งค่าไม่สำเร็จ',
      )
    },
  })
}
