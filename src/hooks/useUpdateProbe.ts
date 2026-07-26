'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateProbe, type ProbeInput } from '@/lib/api/probes'
import { ApiError } from '@/lib/apiClient'

export function useUpdateProbe(deviceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ProbeInput }) =>
      updateProbe(id, dto),
    onSuccess: () => {
      toast.success('บันทึกโพรบสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['devices', deviceId, 'probes'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'บันทึกโพรบไม่สำเร็จ',
      )
    },
  })
}
