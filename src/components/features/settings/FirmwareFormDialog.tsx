'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import type {
  CreateFirmwareInput,
  Firmware,
  UpdateFirmwareInput,
} from '@/lib/api/firmware'
import { formatBytes } from '@/lib/utils'

export interface FirmwareFormDialogHandle {
  open: (firmware?: Firmware) => void
}

type FirmwareFormValues = Omit<CreateFirmwareInput, 'file'> & {
  file?: File | null
}

export const FirmwareFormDialog = forwardRef<
  FirmwareFormDialogHandle,
  {
    onCreate: (dto: CreateFirmwareInput) => void
    onUpdate: (id: string, dto: UpdateFirmwareInput) => void
    isSubmitting?: boolean
  }
>(function FirmwareFormDialog({ onCreate, onUpdate, isSubmitting }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // เก็บทั้ง firmware ไม่ใช่แค่ id เพราะต้องโชว์ fileName/fileSize เดิมเป็น helper text
  const [editing, setEditing] = useState<Firmware | null>(null)
  const [fileError, setFileError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FirmwareFormValues>({ defaultValues: {} })

  useImperativeHandle(ref, () => ({
    open: (firmware) => {
      setEditing(firmware ?? null)
      setFileError('')
      reset(
        firmware
          ? {
              version: firmware.version,
              name: firmware.name,
              description: firmware.description ?? undefined,
              file: null,
            }
          : {
              // react-hook-form's reset() falls back to the *current* field
              // value when a key is `undefined` — must pass '' to actually
              // clear an uncontrolled input, not undefined.
              version: '',
              name: '',
              description: '',
              file: null,
            },
      )
      dialogRef.current?.showModal()
    },
  }))

  const submit = handleSubmit((values) => {
    const { file, version, ...rest } = values
    if (!editing && !file) {
      setFileError('กรุณาเลือกไฟล์เฟิร์มแวร์')
      return
    }
    setFileError('')
    if (editing) {
      onUpdate(editing.id, { ...rest, ...(file ? { file } : {}) })
    } else {
      onCreate({ ...rest, version, file: file as File })
    }
    dialogRef.current?.close()
  })

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold">
          {editing ? 'แก้ไขเฟิร์มแวร์' : 'อัปโหลดเฟิร์มแวร์'}
        </h3>
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                เวอร์ชัน *
              </label>
              <input
                className="input input-sm input-bordered w-full font-mono"
                // เวอร์ชันแก้ไม่ได้หลังสร้าง — backend เมินฟิลด์นี้ถ้าส่งไปตอนอัปเดต
                disabled={Boolean(editing)}
                {...register('version', { required: 'กรุณากรอกเวอร์ชัน' })}
              />
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.version?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">ชื่อ *</label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('name', { required: 'กรุณากรอกชื่อ' })}
              />
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.name?.message}
              </span>
            </div>

            <div className="form-control sm:col-span-2">
              <label className="label-text mb-1 block text-xs">
                คำอธิบาย
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={2}
                {...register('description')}
              />
            </div>

            <div className="form-control sm:col-span-2">
              <label className="label-text mb-1 block text-xs">
                ไฟล์เฟิร์มแวร์ {editing ? '' : '*'}
              </label>
              <Controller
                control={control}
                name="file"
                render={({ field: { onChange, ref: fieldRef } }) => (
                  <input
                    type="file"
                    ref={fieldRef}
                    className="file-input file-input-sm file-input-bordered w-full"
                    onChange={(event) =>
                      onChange(event.target.files?.[0] ?? null)
                    }
                  />
                )}
              />
              {editing && (
                <span className="mt-1 text-xs text-base-content/50">
                  ไฟล์ปัจจุบัน: {editing.fileName} (
                  {formatBytes(editing.fileSize)}) — ไม่เลือกไฟล์ใหม่จะคงไฟล์เดิมไว้
                </span>
              )}
              <span className="mt-1 text-xs text-error empty:hidden">
                {fileError}
              </span>
            </div>
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
