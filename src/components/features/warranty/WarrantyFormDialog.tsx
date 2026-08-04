'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import type {
  CreateWarrantyInput,
  UpdateWarrantyInput,
  Warranty,
} from '@/lib/api/warranty'

export interface WarrantyFormDialogHandle {
  open: (warranty?: Warranty) => void
}

export const WarrantyFormDialog = forwardRef<
  WarrantyFormDialogHandle,
  {
    onSubmit: (id: string | null, dto: CreateWarrantyInput) => void
    /** ตัวเลือกอุปกรณ์สำหรับ datalist ของช่อง serial */
    serialOptions?: { serial: string; devName: string; label: string }[]
    isSubmitting?: boolean
  }
>(function WarrantyFormDialog(
  { onSubmit, serialOptions = [], isSubmitting },
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateWarrantyInput>({ defaultValues: {} })

  useImperativeHandle(ref, () => ({
    open: (warranty) => {
      setEditingId(warranty?.id ?? null)
      reset(
        warranty
          ? {
              serial: warranty.serial,
              devName: warranty.devName ?? undefined,
              product: warranty.product ?? undefined,
              model: warranty.model ?? undefined,
              installDate: warranty.installDate ?? undefined,
              customerName: warranty.customerName ?? undefined,
              customerAddress: warranty.customerAddress ?? undefined,
              saleDepartment: warranty.saleDepartment ?? undefined,
              invoice: warranty.invoice ?? undefined,
              expire: warranty.expire.slice(0, 10),
              status: warranty.status,
              note: warranty.note ?? undefined,
            }
          : { status: true },
      )
      dialogRef.current?.showModal()
    },
  }))

  const handleSerialChange = (value: string) => {
    const matched = serialOptions.find((option) => option.serial === value)
    if (matched) setValue('devName', matched.devName)
  }

  const submit = handleSubmit((values) => {
    onSubmit(editingId, values as CreateWarrantyInput)
    dialogRef.current?.close()
  })

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold">
          {editingId ? 'แก้ไขรายการประกัน' : 'เพิ่มรายการประกัน'}
        </h3>
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="form-control sm:col-span-2">
              <label className="label-text mb-1 block text-xs">
                อุปกรณ์ (serial) *
              </label>
              <input
                className="input input-sm input-bordered w-full font-mono"
                list="warranty-serial-suggestions"
                disabled={Boolean(editingId)}
                {...register('serial', {
                  required: 'กรุณาเลือกอุปกรณ์',
                  onChange: (event) => handleSerialChange(event.target.value),
                })}
              />
              <datalist id="warranty-serial-suggestions">
                {serialOptions.map((option) => (
                  <option key={option.serial} value={option.serial}>
                    {option.label}
                  </option>
                ))}
              </datalist>
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.serial?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">สินค้า</label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('product')}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">รุ่น</label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('model')}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ชื่อลูกค้า
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('customerName')}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ที่อยู่ลูกค้า
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('customerAddress')}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                แผนกขาย
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('saleDepartment')}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                เลขที่ใบกำกับ
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('invoice')}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                วันที่ติดตั้ง
              </label>
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                {...register('installDate')}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                วันหมดประกัน *
              </label>
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                {...register('expire', {
                  required: 'กรุณาเลือกวันหมดประกัน',
                })}
              />
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.expire?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2 px-0">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  {...register('status')}
                />
                <span className="label-text text-xs">ใช้งานอยู่</span>
              </label>
            </div>

            <div className="form-control sm:col-span-2">
              <label className="label-text mb-1 block text-xs">หมายเหตุ</label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('note')}
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
