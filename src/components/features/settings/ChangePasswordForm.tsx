'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useHydrated } from '@/hooks/useHydrated'
import { useResetPassword } from '@/hooks/useResetPassword'
import { useAuthStore } from '@/store/useAuthStore'

const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(4, 'รหัสผ่านอย่างน้อย 4 ตัวอักษร').max(20),
    password: z
      .string()
      .min(4, 'รหัสผ่านอย่างน้อย 4 ตัวอักษร')
      .max(20, 'รหัสผ่านยาวไม่เกิน 20 ตัวอักษร'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'รหัสผ่านยืนยันไม่ตรงกัน',
  })
type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>

const FIELDS: { name: keyof ChangePasswordValues; label: string }[] = [
  { name: 'oldPassword', label: 'รหัสผ่านเดิม' },
  { name: 'password', label: 'รหัสผ่านใหม่' },
  { name: 'confirmPassword', label: 'ยืนยันรหัสผ่านใหม่' },
]

export function ChangePasswordForm() {
  const hydrated = useHydrated()
  const userId = useAuthStore((state) => state.payload?.id)
  const resetPassword = useResetPassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { oldPassword: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit((values) => {
    if (!userId) return
    resetPassword.mutate(
      {
        id: userId,
        dto: { password: values.password, oldPassword: values.oldPassword },
      },
      { onSuccess: () => reset() },
    )
  })

  if (!hydrated) return <span className="loading loading-spinner loading-md" />

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex max-w-md flex-col gap-3"
    >
      {FIELDS.map((field) => (
        <div key={field.name} className="form-control">
          <label
            htmlFor={field.name}
            className="label-text mb-1 block text-xs"
          >
            {field.label}
          </label>
          <input
            id={field.name}
            type="password"
            autoComplete={
              field.name === 'oldPassword' ? 'current-password' : 'new-password'
            }
            className="input input-sm input-bordered w-full"
            aria-invalid={Boolean(errors[field.name])}
            {...register(field.name)}
          />
          <span aria-live="polite" className="mt-1 text-xs text-error empty:hidden">
            {errors[field.name]?.message}
          </span>
        </div>
      ))}

      <button
        type="submit"
        className="btn btn-primary btn-sm self-start"
        disabled={resetPassword.isPending || !userId}
      >
        {resetPassword.isPending && (
          <span className="loading loading-spinner loading-xs" />
        )}
        เปลี่ยนรหัสผ่าน
      </button>
    </form>
  )
}
