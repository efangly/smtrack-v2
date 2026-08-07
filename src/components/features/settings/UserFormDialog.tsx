'use client'

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Controller, useForm } from 'react-hook-form'

import { ImageUploadField } from '@/components/ui/ImageUploadField'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { useWards } from '@/hooks/useWards'
import type { CreateUserInput, UpdateUserInput, User } from '@/lib/api/users'
import { resolveApiImageUrl } from '@/lib/imageUrl'
import { ROLE_LABELS, ROLE_OPTIONS } from '@/types/auth'

export interface UserFormDialogHandle {
  open: (user?: User) => void
}

// ฟอร์มเดียวใช้ทั้งเพิ่มและแก้ไข แต่ field ต่างกัน: ตอนเพิ่มต้องมีรหัสผ่านและส่งเป็น JSON,
// ตอนแก้ไขไม่แตะรหัสผ่าน (มี ResetPasswordDialog แยก)
type UserFormValues = CreateUserInput & { image?: File | null }

export const UserFormDialog = forwardRef<
  UserFormDialogHandle,
  {
    // POST /user รับ JSON เท่านั้น รูปจึงส่งแยกเป็นขั้นที่สอง — ดู UserList
    onCreate: (dto: CreateUserInput, image?: File) => void
    onUpdate: (id: string, dto: UpdateUserInput) => void
    isSubmitting?: boolean
  }
>(function UserFormDialog({ onCreate, onUpdate, isSubmitting }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // เก็บทั้ง user ไม่ใช่แค่ id เพราะต้องใช้ pic เดิมมาแสดงเป็น preview
  const [editing, setEditing] = useState<User | null>(null)
  const { data: wards } = useWards()
  const wardOptions = useMemo(
    () =>
      wards?.map((ward) => ({
        value: ward.id,
        label: ward.wardName,
        hint: ward.hospital?.hosName,
      })) ?? [],
    [wards],
  )

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({ defaultValues: {} })

  useImperativeHandle(ref, () => ({
    open: (user) => {
      setEditing(user ?? null)
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
              image: null,
            }
          : {
              // react-hook-form's reset() falls back to the *current* field
              // value when a key is `undefined` — must pass '' to actually
              // clear an uncontrolled input, not undefined.
              username: '',
              wardId: '',
              role: 'USER',
              status: true,
              display: '',
              comment: '',
              password: '',
              image: null,
            },
      )
      dialogRef.current?.showModal()
    },
  }))

  const submit = handleSubmit((values) => {
    const { image, password, ...shared } = values
    if (editing) {
      // ไม่ส่ง password ในเส้นทางแก้ไข — การตั้งรหัสใหม่ทำผ่าน ResetPasswordDialog
      onUpdate(editing.id, { ...shared, ...(image ? { image } : {}) })
    } else {
      onCreate({ ...shared, password }, image ?? undefined)
    }
    dialogRef.current?.close()
  })

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold">
          {editing ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}
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

            {!editing && (
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
              <label
                htmlFor="user-ward"
                className="label-text mb-1 block text-xs"
              >
                วอร์ด *
              </label>
              <Controller
                control={control}
                name="wardId"
                rules={{ required: 'กรุณาเลือกวอร์ด' }}
                render={({ field }) => (
                  <SearchableSelect
                    id="user-ward"
                    options={wardOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="- เลือกวอร์ด -"
                  />
                )}
              />
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

            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUploadField
                  label="รูปโปรไฟล์"
                  currentUrl={resolveApiImageUrl(editing?.pic)}
                  value={field.value ?? null}
                  onChange={field.onChange}
                  size={72}
                />
              )}
            />

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
