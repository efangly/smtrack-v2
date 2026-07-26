'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateDevice, type UpdateDeviceInput } from '@/lib/api/devices'
import { ApiError } from '@/lib/apiClient'

/**
 * `serial` ใส่เมื่อเรียกจากหน้ารายละเอียดอุปกรณ์ เพื่อ invalidate cache ของตัวนั้นด้วย —
 * หน้าทะเบียนอุปกรณ์แก้ได้หลายเครื่องจึงไม่มี serial เจาะจงให้ส่ง
 */
export function useUpdateDevice(serial?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDeviceInput }) =>
      updateDevice(id, dto),
    onSuccess: () => {
      toast.success('บันทึกข้อมูลอุปกรณ์สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      if (serial) {
        queryClient.invalidateQueries({ queryKey: ['devices', serial] })
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'บันทึกข้อมูลไม่สำเร็จ',
      )
    },
  })
}
