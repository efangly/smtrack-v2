'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { deleteProbe } from '@/lib/api/probes'
import { ApiError } from '@/lib/apiClient'

export function useDeleteProbe(deviceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProbe(id),
    onSuccess: () => {
      toast.success('ลบโพรบสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['devices', deviceId, 'probes'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'ลบโพรบไม่สำเร็จ')
    },
  })
}
