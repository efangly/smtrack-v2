'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { swapDevice, type SwapDeviceInput } from '@/lib/api/devices'
import { ApiError } from '@/lib/apiClient'

export function useSwapDevice(staticName: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: SwapDeviceInput) => swapDevice(staticName, dto),
    onSuccess: (result) => {
      toast.success(`สลับอุปกรณ์เป็น serial ${result.device.serial} สำเร็จ`)
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({
        queryKey: ['devices', 'assignments', staticName],
      })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'สลับอุปกรณ์ไม่สำเร็จ',
      )
    },
  })
}
