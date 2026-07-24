'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { restoreMonth } from '@/lib/api/backup'
import { ApiError } from '@/lib/apiClient'

export function useRestoreMonth() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (month: string) => restoreMonth(month),
    onSuccess: (result) => {
      toast.success(
        `Restore เดือน ${result.month} สำเร็จ (${result.rowCount} แถว)`,
      )
      queryClient.invalidateQueries({ queryKey: ['backup', 'months'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Restore ไม่สำเร็จ',
      )
    },
  })
}
