'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import { createPortal } from 'react-dom'

import { useHydrated } from '@/hooks/useHydrated'

export interface ConfirmDialogHandle {
  showModal: () => void
}

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  isLoading?: boolean
}

export const ConfirmDialog = forwardRef<
  ConfirmDialogHandle,
  ConfirmDialogProps
>(function ConfirmDialog(
  { title, description, confirmLabel = 'ยืนยัน', onConfirm, isLoading },
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const hydrated = useHydrated()

  useImperativeHandle(ref, () => ({
    showModal: () => dialogRef.current?.showModal(),
  }))

  if (!hydrated) return null

  return createPortal(
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="py-4">{description}</p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn">ยกเลิก</button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={() => {
                onConfirm()
                dialogRef.current?.close()
              }}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                confirmLabel
              )}
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>,
    document.body,
  )
})
