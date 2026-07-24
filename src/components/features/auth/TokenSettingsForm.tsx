'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { useAuthStore } from '@/store/useAuthStore'

const FormSchema = z.object({
  token: z.string().min(1, 'กรุณาวาง Authorization token'),
})
type FormValues = z.infer<typeof FormSchema>

export function TokenSettingsForm() {
  const { token, payload, setToken, clearToken } = useAuthStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { token: token ?? '' },
  })

  const onSubmit = handleSubmit((values) => {
    setToken(values.token.trim())
    toast.success('บันทึก token สำเร็จ')
  })

  const onClear = () => {
    clearToken()
    reset({ token: '' })
    toast.success('ล้าง token แล้ว')
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="form-control">
          <span className="label-text mb-1">Authorization token (JWT)</span>
          <textarea
            className="textarea textarea-bordered font-mono text-sm"
            rows={4}
            placeholder="eyJhbGciOi..."
            {...register('token')}
          />
          {errors.token && (
            <span className="text-error text-sm mt-1">
              {errors.token.message}
            </span>
          )}
        </label>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">
            บันทึก
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            ล้างโทเคน
          </button>
        </div>
      </form>

      {payload ? (
        <div className="text-sm flex flex-col gap-1">
          <span className="font-semibold">ข้อมูลที่ถอดรหัสได้จาก token</span>
          <span>ชื่อ: {payload.name}</span>
          <span>สิทธิ์: {payload.role}</span>
          <span>วอร์ด: {payload.wardId}</span>
        </div>
      ) : token ? (
        <span className="text-error text-sm">
          ไม่สามารถถอดรหัส token นี้ได้ กรุณาตรวจสอบว่าเป็น JWT ที่ถูกต้อง
        </span>
      ) : null}
    </div>
  )
}
