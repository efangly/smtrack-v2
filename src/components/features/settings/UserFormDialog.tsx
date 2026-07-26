'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useWards } from '@/hooks/useWards'
import type { CreateUserInput, UpdateUserInput, User } from '@/lib/api/users'
import { ROLE_LABELS, ROLE_OPTIONS } from '@/types/auth'

export interface UserFormDialogHandle {
  open: (user?: User) => void
}

// ฟอร์มเดียวใช้ทั้งเพิ่มและแก้ไข แต่ field ต่างกัน: ตอนเพิ่มต้องมีรหัสผ่านและส่งเป็น JSON,
// ตอนแก้ไขไม่แตะรหัสผ่าน (มี ResetPasswordDialog แยก) แต่แนบรูปโปรไฟล์ได้
type UserFormValues = CreateUserInput & { image?: FileList }

export const UserFormDialog = forwardRef<
  UserFormDialogHandle,
  {
    onCreate: (dto: CreateUserInput) => void
    onUpdate: (id: string, dto: UpdateUserInput) => void
    isSubmitting?: boolean
  }
>(function UserFormDialog({ onCreate, onUpdate, isSubmitting }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { data: wards } = useWards()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({ defaultValues: {} })

  useImperativeHandle(ref, () => ({
    open: (user) => {
      setEditingId(user?.id ?? null)
      reset(
        user
          ? {
              username: user.username,
              wardId: user.wardId,
              role: user.role,
              status: user.status,
              display: user.display ?? undefined,
              comment: user.comment ?? undefined,
              password: undefined,
            }
          : { status: true, role: 'USER' },
      )
      dialogRef.current?.showModal()
    },
  }))

  const submit = handleSubmit((values) => {
    const { image, password, ...shared } = values
    if (editingId) {
      // ไม่ส่ง password ในเส้นทางแก้ไข — การตั้งรหัสใหม่ทำผ่าน ResetPasswordDialog
      const file = image?.[0]
      onUpdate(editingId, { ...shared, ...(file ? { image: file } : {}) })
    } else {
      onCreate({ ...shared, password })
    }
    dialogRef.current?.close()
  })

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold">
          {editingId ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}
        </h3>
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ชื่อผู้ใช้ *
              </label>
              <input
                className="input input-sm input-bordered w-full"
                autoComplete="off"
                {...register('username', {
                  required: 'กรุณากรอกชื่อผู้ใช้',
                  maxLength: {
                    value: 40,
                    message: 'ชื่อผู้ใช้ยาวไม่เกิน 40 ตัวอักษร',
                  },
                })}
              />
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.username?.message}
              </span>
            </div>

            {!editingId && (
              <div className="form-control">
                <label className="label-text mb-1 block text-xs">
                  รหัสผ่าน *
                </label>
                <input
                  type="password"
                  className="input input-sm input-bordered w-full"
                  autoComplete="new-password"
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
            )}

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ชื่อที่แสดง
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('display')}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">วอร์ด *</label>
              <select
                className="select select-sm select-bordered w-full"
                {...register('wardId', { required: 'กรุณาเลือกวอร์ด' })}
              >
                <option value="">- เลือกวอร์ด -</option>
                {wards?.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.wardName}
                    {ward.hospital ? ` — ${ward.hospital.hosName}` : ''}
                  </option>
                ))}
              </select>
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.wardId?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">สิทธิ์</label>
              <select
                className="select select-sm select-bordered w-full"
                {...register('role')}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">หมายเหตุ</label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('comment')}
              />
            </div>

            {editingId && (
              <div className="form-control">
                <label className="label-text mb-1 block text-xs">
                  รูปโปรไฟล์
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-sm file-input-bordered w-full"
                  {...register('image')}
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                {...register('status')}
              />
              เปิดใช้งานบัญชี
            </label>
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
              บันทึก
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
