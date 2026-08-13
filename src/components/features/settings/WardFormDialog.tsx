'use client'

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Controller, useForm } from 'react-hook-form'

import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { useHospitals } from '@/hooks/useHospitals'
import { useHydrated } from '@/hooks/useHydrated'
import {
  WARD_TYPE_LABELS,
  WARD_TYPE_OPTIONS,
  type Ward,
  type WardInput,
} from '@/lib/api/wards'

export interface WardFormDialogHandle {
  open: (ward?: Ward) => void
}

export const WardFormDialog = forwardRef<
  WardFormDialogHandle,
  {
    onSubmit: (id: string | null, dto: WardInput) => void
    isSubmitting?: boolean
    /** ล็อกโรงพยาบาลตายตัวและซ่อน dropdown เลือก — ใช้ตอนเปิดจากในโมดัลแก้ไขโรงพยาบาล */
    lockedHosId?: string
  }
>(function WardFormDialog({ onSubmit, isSubmitting, lockedHosId }, ref) {
  const hydrated = useHydrated()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { data: hospitals } = useHospitals(!lockedHosId)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WardInput>({ defaultValues: {} })

  const hospitalOptions = useMemo(
    () =>
      hospitals?.map((hospital) => ({
        value: hospital.id,
        label: hospital.hosName,
      })) ?? [],
    [hospitals],
  )

  useImperativeHandle(ref, () => ({
    open: (ward) => {
      setEditingId(ward?.id ?? null)
      reset(
        ward
          ? {
              wardName: ward.wardName,
              wardSeq: ward.wardSeq,
              type: ward.type ?? undefined,
              hosId: lockedHosId ?? ward.hosId,
            }
          : {
              // react-hook-form's reset() falls back to the *current* field
              // value when a key is `undefined` — must pass '' to actually
              // clear an uncontrolled input, not undefined.
              wardName: '',
              wardSeq: 0,
              type: 'NEW',
              hosId: lockedHosId ?? '',
            },
      )
      dialogRef.current?.showModal()
    },
  }))

  const submit = handleSubmit((values) => {
    onSubmit(editingId, values)
    dialogRef.current?.close()
  })

  if (!hydrated) return null

  // portal ไปที่ document.body — dialog นี้อาจถูกเปิดจากใน <form> ของ HospitalFormDialog
  // (ดู HospitalWardsSection) ถ้า render อยู่ในต้นไม้ปกติจะได้ <form> ซ้อน <form> ซึ่ง HTML ไม่อนุญาต
  return createPortal(
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-xl">
        <h3 className="text-lg font-bold">
          {editingId ? 'แก้ไขวอร์ด' : 'เพิ่มวอร์ด'}
        </h3>
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ชื่อวอร์ด *
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('wardName', {
                  required: 'กรุณากรอกชื่อวอร์ด',
                  maxLength: {
                    value: 150,
                    message: 'ชื่อวอร์ดยาวไม่เกิน 150 ตัวอักษร',
                  },
                })}
              />
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.wardName?.message}
              </span>
            </div>

            {!lockedHosId && (
              <div className="form-control">
                <label
                  htmlFor="ward-hospital"
                  className="label-text mb-1 block text-xs"
                >
                  โรงพยาบาล *
                </label>
                <Controller
                  control={control}
                  name="hosId"
                  rules={{ required: 'กรุณาเลือกโรงพยาบาล' }}
                  render={({ field }) => (
                    <SearchableSelect
                      id="ward-hospital"
                      options={hospitalOptions}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="- เลือกโรงพยาบาล -"
                    />
                  )}
                />
                <span className="mt-1 text-xs text-error empty:hidden">
                  {errors.hosId?.message}
                </span>
              </div>
            )}

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">ลำดับ</label>
              <input
                type="number"
                className="input input-sm input-bordered w-full"
                {...register('wardSeq', { valueAsNumber: true })}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">ประเภท</label>
              <select
                className="select select-sm select-bordered w-full"
                {...register('type')}
              >
                {WARD_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {WARD_TYPE_LABELS[option]}
                  </option>
                ))}
              </select>
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
    </dialog>,
    document.body,
  )
})
