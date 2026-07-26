'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateUser, type UpdateUserInput } from '@/lib/api/users'
import { ApiError } from '@/lib/apiClient'

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserInput }) =>
      updateUser(id, dto),
    onSuccess: (user) => {
      toast.success('บันทึกข้อมูลผู้ใช้สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', user.id] })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'บันทึกข้อมูลผู้ใช้ไม่สำเร็จ',
      )
    },
  })
}
