'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createHospital, type HospitalInput } from '@/lib/api/hospitals'
import { ApiError } from '@/lib/apiClient'

export function useCreateHospital() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: HospitalInput) => createHospital(dto),
    onSuccess: () => {
      toast.success('เพิ่มโรงพยาบาลสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'เพิ่มโรงพยาบาลไม่สำเร็จ',
      )
    },
  })
}
