'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import type { ResetPasswordInput } from '@/lib/api/users'

export interface ResetPasswordDialogHandle {
  open: (user: { id: string; username: string }) => void
}

interface ResetPasswordValues {
  password: string
  confirmPassword: string
}

/**
 * ใช้ตอน admin รีเซ็ตรหัสผ่านของผู้ใช้คนอื่น — ไม่ต้องส่ง oldPassword
 * (การเปลี่ยนรหัสของตัวเองอยู่ที่ ChangePasswordForm ซึ่งบังคับยืนยันรหัสเดิม)
 */
export const ResetPasswordDialog = forwardRef<
  ResetPasswordDialogHandle,
  {
    onSubmit: (id: string, dto: ResetPasswordInput) => void
    isSubmitting?: boolean
  }
>(function ResetPasswordDialog({ onSubmit, isSubmitting }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [target, setTarget] = useState<{ id: string; username: string } | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    defaultValues: { password: '', confirmPassword: '' },
  })

  useImperativeHandle(ref, () => ({
    open: (user) => {
      setTarget(user)
      reset({ password: '', confirmPassword: '' })
      dialogRef.current?.showModal()
    },
  }))

  const submit = handleSubmit((values) => {
    if (!target) return
    onSubmit(target.id, { password: values.password })
    dialogRef.current?.close()
  })

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-md">
        <h3 className="text-lg font-bold">รีเซ็ตรหัสผ่าน</h3>
        <p className="mt-1 text-sm text-base-content/60">
          ตั้งรหัสผ่านใหม่ให้ {target?.username ?? '-'}
        </p>
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
          <div className="form-control">
            <label className="label-text mb-1 block text-xs">รหัสผ่านใหม่</label>
            <input
              type="password"
              autoComplete="new-password"
              className="input input-sm input-bordered w-full"
              {...register('password', {
                required: 'กรุณากรอกรหัสผ่าน',
                minLength: {
                  value: 4,
                  message: 'รหัสผ่านอย่างน้อย 4 ตัวอักษร',
                },
                maxLength: {
                  value: 20,
                  message: 'รหัสผ่านยาวไม่เกิน 20 ตัวอักษร',
                },
              })}
            />
            <span className="mt-1 text-xs text-error empty:hidden">
              {errors.password?.message}
            </span>
          </div>

          <div className="form-control">
            <label className="label-text mb-1 block text-xs">
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="input input-sm input-bordered w-full"
              {...register('confirmPassword', {
                validate: (value) =>
                  value === watch('password') || 'รหัสผ่านยืนยันไม่ตรงกัน',
              })}
            />
            <span className="mt-1 text-xs text-error empty:hidden">
              {errors.confirmPassword?.message}
            </span>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => dialogRef.current?.close()}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="loading loading-spinner loading-xs" />
              )}
              รีเซ็ต
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
})
