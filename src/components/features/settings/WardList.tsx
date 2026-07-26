'use client'

import { useRef } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { useCreateWard } from '@/hooks/useCreateWard'
import { useDeleteWard } from '@/hooks/useDeleteWard'
import { useUpdateWard } from '@/hooks/useUpdateWard'
import { useWards } from '@/hooks/useWards'
import { WARD_TYPE_LABELS } from '@/lib/api/wards'
import { canManageWards } from '@/lib/permissions'
import { useAuthStore } from '@/store/useAuthStore'

import { WardFormDialog, type WardFormDialogHandle } from './WardFormDialog'

export function WardList() {
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = canManageWards(role)

  const { data: wards, isLoading, isError } = useWards()
  const createWard = useCreateWard()
  const updateWard = useUpdateWard()
  const deleteWard = useDeleteWard()

  const formDialogRef = useRef<WardFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดรายการวอร์ดได้</p>

  return (
    <div className="flex flex-col gap-3">
      {canManage && (
        <button
          type="button"
          className="btn btn-primary btn-sm self-start"
          onClick={() => formDialogRef.current?.open()}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          เพิ่มวอร์ด
        </button>
      )}

      {!wards || wards.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีวอร์ดในระบบ</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อวอร์ด</th>
                <th>ประเภท</th>
                <th>โรงพยาบาล</th>
                {canManage && <th className="text-right">การจัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {wards.map((ward) => (
                <tr key={ward.id}>
                  <td>{ward.wardSeq}</td>
                  <td className="font-medium">{ward.wardName}</td>
                  <td>{ward.type ? WARD_TYPE_LABELS[ward.type] : '-'}</td>
                  <td>{ward.hospital?.hosName ?? '-'}</td>
                  {canManage && (
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          aria-label={`แก้ไข ${ward.wardName}`}
                          onClick={() => formDialogRef.current?.open(ward)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          aria-label={`ลบ ${ward.wardName}`}
                          onClick={() => {
                            targetIdRef.current = ward.id
                            deleteDialogRef.current?.showModal()
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WardFormDialog
        ref={formDialogRef}
        isSubmitting={createWard.isPending || updateWard.isPending}
        onSubmit={(id, dto) => {
          if (id) {
            updateWard.mutate({ id, dto })
          } else {
            createWard.mutate(dto)
          }
        }}
      />

      <ConfirmDialog
        ref={deleteDialogRef}
        title="ยืนยันลบวอร์ด"
        description="วอร์ดนี้จะถูกลบออกจากระบบ ผู้ใช้และอุปกรณ์ที่อ้างถึงวอร์ดนี้อาจได้รับผลกระทบ"
        confirmLabel="ลบ"
        isLoading={deleteWard.isPending}
        onConfirm={() => deleteWard.mutate(targetIdRef.current)}
      />
    </div>
  )
}
