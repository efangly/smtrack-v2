'use client'

import { useMemo, useRef } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { ConfirmDialog, type ConfirmDialogHandle } from '@/components/ui/ConfirmDialog'
import { useCreateWard } from '@/hooks/useCreateWard'
import { useDeleteWard } from '@/hooks/useDeleteWard'
import { useHydrated } from '@/hooks/useHydrated'
import { useUpdateWard } from '@/hooks/useUpdateWard'
import { useWards } from '@/hooks/useWards'
import { WARD_TYPE_LABELS } from '@/lib/api/wards'
import { canManageWards } from '@/lib/permissions'
import { useAuthStore } from '@/store/useAuthStore'

import { WardFormDialog, type WardFormDialogHandle } from './WardFormDialog'

export function HospitalWardsSection({ hospitalId }: { hospitalId: string }) {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageWards(role)

  const { data: wards, isLoading } = useWards()
  const createWard = useCreateWard()
  const updateWard = useUpdateWard()
  const deleteWard = useDeleteWard()

  const formDialogRef = useRef<WardFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')

  const hospitalWards = useMemo(
    () => wards?.filter((ward) => ward.hosId === hospitalId) ?? [],
    [wards, hospitalId],
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="divider my-0">วอร์ดในโรงพยาบาลนี้</div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-base-content/60">
          {hospitalWards.length} วอร์ด
        </span>
        {canManage && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => formDialogRef.current?.open()}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            เพิ่มวอร์ด
          </button>
        )}
      </div>

      {isLoading ? (
        <span className="loading loading-spinner loading-sm" />
      ) : hospitalWards.length === 0 ? (
        <p className="text-sm text-base-content/60">
          โรงพยาบาลนี้ยังไม่มีวอร์ด
        </p>
      ) : (
        <div className="overflow-x-auto scrollbar-slim">
          <table className="table table-zebra table-xs">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อวอร์ด</th>
                <th>ประเภท</th>
                {canManage && <th className="text-right">การจัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {hospitalWards.map((ward) => (
                <tr key={ward.id}>
                  <td>{ward.wardSeq}</td>
                  <td className="font-medium">{ward.wardName}</td>
                  <td>{ward.type ? WARD_TYPE_LABELS[ward.type] : '-'}</td>
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
        lockedHosId={hospitalId}
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
