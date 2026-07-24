'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { exportMonth } from '@/lib/api/backup'
import { ApiError } from '@/lib/apiClient'

export function useExportMonth() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (month: string) => exportMonth(month),
    onSuccess: (result) => {
      toast.success(
        `Export เดือน ${result.month} สำเร็จ (${result.rowCount} แถว)`,
      )
      queryClient.invalidateQueries({ queryKey: ['backup', 'months'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Export ไม่สำเร็จ',
      )
    },
  })
}
