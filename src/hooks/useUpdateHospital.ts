'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateHospital, type HospitalInput } from '@/lib/api/hospitals'
import { ApiError } from '@/lib/apiClient'

export function useUpdateHospital() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<HospitalInput> }) =>
      updateHospital(id, dto),
    onSuccess: () => {
      toast.success('บันทึกข้อมูลโรงพยาบาลสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
      // วอร์ดแสดงชื่อโรงพยาบาลจาก relation ที่ backend preload มา
      queryClient.invalidateQueries({ queryKey: ['wards'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'บันทึกข้อมูลโรงพยาบาลไม่สำเร็จ',
      )
    },
  })
}
