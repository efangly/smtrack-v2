'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { removeRestoreMonth } from '@/lib/api/backup'
import { ApiError } from '@/lib/apiClient'

export function useRemoveRestore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (month: string) => removeRestoreMonth(month),
    onSuccess: (result) => {
      toast.success(`ลบข้อมูลที่ restore ของเดือน ${result.month} สำเร็จ`)
      queryClient.invalidateQueries({ queryKey: ['backup', 'months'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'ลบข้อมูลไม่สำเร็จ',
      )
    },
  })
}
