'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  HOS_TYPE_LABELS,
  HOS_TYPE_OPTIONS,
  type Hospital,
  type HospitalInput,
} from '@/lib/api/hospitals'

export interface HospitalFormDialogHandle {
  open: (hospital?: Hospital) => void
}

type HospitalFormValues = Omit<HospitalInput, 'image'> & { image?: FileList }

// ฟิลด์ข้อความล้วนที่ไม่มี logic พิเศษ — ไล่ render จาก array แบบเดียวกับ DeviceConfigPanel
const TEXT_FIELDS: {
  key: keyof HospitalFormValues
  label: string
}[] = [
  { key: 'hosAddress', label: 'ที่อยู่' },
  { key: 'hosTel', label: 'เบอร์โทรโรงพยาบาล' },
  { key: 'userContact', label: 'ชื่อผู้ติดต่อ' },
  { key: 'userTel', label: 'เบอร์ผู้ติดต่อ' },
  { key: 'hosLatitude', label: 'ละติจูด' },
  { key: 'hosLongitude', label: 'ลองจิจูด' },
]

export const HospitalFormDialog = forwardRef<
  HospitalFormDialogHandle,
  {
    onSubmit: (id: string | null, dto: HospitalInput) => void
    isSubmitting?: boolean
  }
>(function HospitalFormDialog({ onSubmit, isSubmitting }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HospitalFormValues>({ defaultValues: {} })

  useImperativeHandle(ref, () => ({
    open: (hospital) => {
      setEditingId(hospital?.id ?? null)
      reset(
        hospital
          ? {
              hosName: hospital.hosName,
              hosSeq: hospital.hosSeq,
              hosAddress: hospital.hosAddress ?? undefined,
              hosTel: hospital.hosTel ?? undefined,
              userContact: hospital.userContact ?? undefined,
              userTel: hospital.userTel ?? undefined,
              hosLatitude: hospital.hosLatitude ?? undefined,
              hosLongitude: hospital.hosLongitude ?? undefined,
              hosType: hospital.hosType,
            }
          : { hosType: 'HOSPITAL' },
      )
      dialogRef.current?.showModal()
    },
  }))

  const submit = handleSubmit((values) => {
    const { image, ...rest } = values
    const file = image?.[0]
    onSubmit(editingId, { ...rest, ...(file ? { image: file } : {}) })
    dialogRef.current?.close()
  })

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold">
          {editingId ? 'แก้ไขโรงพยาบาล' : 'เพิ่มโรงพยาบาล'}
        </h3>
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ชื่อโรงพยาบาล *
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('hosName', {
                  required: 'กรุณากรอกชื่อโรงพยาบาล',
                  maxLength: {
                    value: 150,
                    message: 'ชื่อโรงพยาบาลยาวไม่เกิน 150 ตัวอักษร',
                  },
                })}
              />
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.hosName?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">ประเภท</label>
              <select
                className="select select-sm select-bordered w-full"
                {...register('hosType')}
              >
                {HOS_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {HOS_TYPE_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            {TEXT_FIELDS.map((field) => (
              <div key={field.key} className="form-control">
                <label className="label-text mb-1 block text-xs">
                  {field.label}
                </label>
                <input
                  className="input input-sm input-bordered w-full"
                  {...register(field.key)}
                />
              </div>
            ))}

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">ลำดับ</label>
              <input
                type="number"
                className="input input-sm input-bordered w-full"
                {...register('hosSeq', { valueAsNumber: true })}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                รูปโรงพยาบาล
              </label>
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-sm file-input-bordered w-full"
                {...register('image')}
              />
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
