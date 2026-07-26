'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { deleteHospital } from '@/lib/api/hospitals'
import { ApiError } from '@/lib/apiClient'

export function useDeleteHospital() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteHospital(id),
    onSuccess: () => {
      toast.success('ลบโรงพยาบาลสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
      queryClient.invalidateQueries({ queryKey: ['wards'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'ลบโรงพยาบาลไม่สำเร็จ',
      )
    },
  })
}
