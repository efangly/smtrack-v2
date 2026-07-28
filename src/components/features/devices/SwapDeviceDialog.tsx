'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Repeat } from 'lucide-react'

import { useAuthStore } from '@/store/useAuthStore'
import { useHydrated } from '@/hooks/useHydrated'
import { canManageDevices } from '@/lib/permissions'
import { useSwapDevice } from '@/hooks/useSwapDevice'
import type { SwapDeviceInput } from '@/lib/api/devices'

export function SwapDeviceDialog({ staticName }: { staticName: string }) {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageDevices(role)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const swapDevice = useSwapDevice(staticName)

  const { register, handleSubmit, reset } = useForm<SwapDeviceInput>({
    defaultValues: { serial: '', reason: '' },
  })

  useEffect(() => {
    if (swapDevice.isSuccess) {
      reset()
      dialogRef.current?.close()
      swapDevice.reset()
    }
  }, [swapDevice, reset])

  if (!canManage) return null

  const submit = handleSubmit((values) => {
    swapDevice.mutate(values)
  })

  return (
    <>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Repeat className="h-4 w-4" aria-hidden="true" />
        สลับอุปกรณ์
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">สลับอุปกรณ์ (Swap serial)</h3>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
            <div className="form-control">
              <label
                className="label-text mb-1 block text-xs"
                htmlFor="swap-serial"
              >
                Serial ใหม่
              </label>
              <input
                id="swap-serial"
                className="input input-sm input-bordered w-full"
                required
                {...register('serial')}
              />
            </div>
            <div className="form-control">
              <label
                className="label-text mb-1 block text-xs"
                htmlFor="swap-reason"
              >
                เหตุผล
              </label>
              <input
                id="swap-reason"
                className="input input-sm input-bordered w-full"
                {...register('reason')}
              />
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
                disabled={swapDevice.isPending}
              >
                {swapDevice.isPending && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                ยืนยันสลับ
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
