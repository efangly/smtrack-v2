'use client'

import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { resetPassword, type ResetPasswordInput } from '@/lib/api/users'
import { ApiError } from '@/lib/apiClient'

// ไม่ต้อง invalidate อะไร — รหัสผ่านไม่เคยถูกส่งกลับมาใน payload ของผู้ใช้
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ResetPasswordInput }) =>
      resetPassword(id, dto),
    onSuccess: () => {
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ')
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ',
      )
    },
  })
}
