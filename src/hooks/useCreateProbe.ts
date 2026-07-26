'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createProbe, type ProbeInput } from '@/lib/api/probes'
import { ApiError } from '@/lib/apiClient'

export function useCreateProbe(deviceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: ProbeInput) => createProbe(deviceId, dto),
    onSuccess: () => {
      toast.success('เพิ่มโพรบสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['devices', deviceId, 'probes'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'เพิ่มโพรบไม่สำเร็จ',
      )
    },
  })
}
