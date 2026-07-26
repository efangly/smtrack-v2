'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { deleteUser } from '@/lib/api/users'
import { ApiError } from '@/lib/apiClient'

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (user) => {
      toast.success('ลบผู้ใช้สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.removeQueries({ queryKey: ['users', user.id] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'ลบผู้ใช้ไม่สำเร็จ')
    },
  })
}
