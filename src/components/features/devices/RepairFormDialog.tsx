'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import type { Repair, UpdateRepairInput } from '@/lib/api/repairs'

export interface RepairFormDialogHandle {
  open: (repair?: Repair) => void
}

export const RepairFormDialog = forwardRef<
  RepairFormDialogHandle,
  {
    onSubmit: (id: string | null, dto: UpdateRepairInput) => void
    isSubmitting?: boolean
  }
>(function RepairFormDialog({ onSubmit, isSubmitting }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<UpdateRepairInput>({
    defaultValues: {},
  })

  useImperativeHandle(ref, () => ({
    open: (repair) => {
      setEditingId(repair?.id ?? null)
      reset(
        repair
          ? {
              devName: repair.devName ?? undefined,
              detail: repair.detail ?? undefined,
              address: repair.address ?? undefined,
              phone: repair.phone ?? undefined,
              status: repair.status ?? undefined,
              warrantyStatus: repair.warrantyStatus ?? undefined,
              remark: repair.remark ?? undefined,
            }
          : {},
      )
      dialogRef.current?.showModal()
    },
  }))

  const submit = handleSubmit((values) => {
    onSubmit(editingId, values)
    dialogRef.current?.close()
  })

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold">
          {editingId ? 'แก้ไขใบซ่อม' : 'แจ้งซ่อมอุปกรณ์'}
        </h3>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="form-control sm:col-span-2">
              <label className="label-text mb-1 block text-xs">
                รายละเอียดปัญหา
              </label>
              <textarea
                className="textarea textarea-bordered textarea-sm w-full"
                {...register('detail')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ชื่ออุปกรณ์
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('devName')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                เบอร์ติดต่อผู้แจ้ง
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('phone')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ที่อยู่ / สถานที่
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('address')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">สถานะ</label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('status')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                สถานะรับประกัน
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('warrantyStatus')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                หมายเหตุ
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('remark')}
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
