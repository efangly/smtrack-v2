'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import type { Probe, ProbeInput } from '@/lib/api/probes'

export interface ProbeFormDialogHandle {
  open: (probe?: Probe) => void
}

export const ProbeFormDialog = forwardRef<
  ProbeFormDialogHandle,
  {
    onSubmit: (id: string | null, dto: ProbeInput) => void
    isSubmitting?: boolean
  }
>(function ProbeFormDialog({ onSubmit, isSubmitting }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<ProbeInput>({
    defaultValues: {},
  })

  useImperativeHandle(ref, () => ({
    open: (probe) => {
      setEditingId(probe?.id ?? null)
      reset(
        probe
          ? {
              name: probe.name ?? undefined,
              type: probe.type ?? undefined,
              channel: probe.channel ?? undefined,
              position: probe.position ?? undefined,
              tempMin: probe.tempMin ?? undefined,
              tempMax: probe.tempMax ?? undefined,
              humiMin: probe.humiMin ?? undefined,
              humiMax: probe.humiMax ?? undefined,
              notiDelay: probe.notiDelay ?? undefined,
              notiMobile: probe.notiMobile ?? undefined,
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
          {editingId ? 'แก้ไขโพรบ' : 'เพิ่มโพรบ'}
        </h3>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ชื่อโพรบ
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('name')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">ประเภท</label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('type')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">Channel</label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('channel')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ตำแหน่งติดตั้ง
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('position')}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                อุณหภูมิต่ำสุด
              </label>
              <input
                type="number"
                step="any"
                className="input input-sm input-bordered w-full"
                {...register('tempMin', { valueAsNumber: true })}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                อุณหภูมิสูงสุด
              </label>
              <input
                type="number"
                step="any"
                className="input input-sm input-bordered w-full"
                {...register('tempMax', { valueAsNumber: true })}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ความชื้นต่ำสุด
              </label>
              <input
                type="number"
                step="any"
                className="input input-sm input-bordered w-full"
                {...register('humiMin', { valueAsNumber: true })}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ความชื้นสูงสุด
              </label>
              <input
                type="number"
                step="any"
                className="input input-sm input-bordered w-full"
                {...register('humiMax', { valueAsNumber: true })}
              />
            </div>
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                หน่วงการแจ้งเตือน (นาที)
              </label>
              <input
                type="number"
                className="input input-sm input-bordered w-full"
                {...register('notiDelay', { valueAsNumber: true })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                {...register('notiMobile')}
              />
              แจ้งเตือนผ่านมือถือ
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
