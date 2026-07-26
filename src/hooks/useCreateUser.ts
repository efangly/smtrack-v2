'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createUser, type CreateUserInput } from '@/lib/api/users'
import { ApiError } from '@/lib/apiClient'

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateUserInput) => createUser(dto),
    onSuccess: () => {
      toast.success('เพิ่มผู้ใช้สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'เพิ่มผู้ใช้ไม่สำเร็จ')
    },
  })
}
