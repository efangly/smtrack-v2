'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { useCreateWard } from '@/hooks/useCreateWard'
import { useDeleteWard } from '@/hooks/useDeleteWard'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { useUpdateWard } from '@/hooks/useUpdateWard'
import { useWards } from '@/hooks/useWards'
import { WARD_TYPE_LABELS } from '@/lib/api/wards'
import { canManageWards } from '@/lib/permissions'
import { useAuthStore } from '@/store/useAuthStore'
import { useHydrated } from '@/hooks/useHydrated'

import { WardFormDialog, type WardFormDialogHandle } from './WardFormDialog'

export function WardList() {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageWards(role)

  const { data: wards, isLoading, isError } = useWards()
  const createWard = useCreateWard()
  const updateWard = useUpdateWard()
  const deleteWard = useDeleteWard()

  const formDialogRef = useRef<WardFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')
  const [keyword, setKeyword] = useState('')
  const { page, limit, setPage, setLimit } = usePaginationParams()

  const filtered = useMemo(() => {
    if (!wards) return []
    const needle = keyword.trim().toLowerCase()
    if (!needle) return wards

    return wards.filter((ward) =>
      [ward.wardName, ward.hospital?.hosName]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle)),
    )
  }, [wards, keyword])

  // เปลี่ยนคำค้นแล้วต้องกลับไปหน้า 1 เสมอ ไม่งั้นอาจค้างอยู่หน้าที่เกินผลลัพธ์ใหม่
  useEffect(() => {
    if (page !== 1) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

  const totalItems = filtered.length
  const paged = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

  const action: ReactNode = canManage && (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={() => formDialogRef.current?.open()}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      เพิ่มวอร์ด
    </button>
  )
  const title = 'รายการวอร์ดทั้งหมด'

  if (isLoading)
    return (
      <Card title={title} action={action}>
        <span className="loading loading-spinner loading-md" />
      </Card>
    )
  if (isError)
    return (
      <Card title={title} action={action}>
        <p className="text-error">ไม่สามารถโหลดรายการวอร์ดได้</p>
      </Card>
    )

  return (
    <Card title={title} action={action}>
      <div className="flex flex-col gap-3">
      <label className="input input-sm input-bordered flex w-full items-center gap-2 sm:max-w-xs">
        <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
        <input
          type="search"
          className="grow"
          placeholder="ค้นหาชื่อวอร์ด / โรงพยาบาล"
          aria-label="ค้นหาวอร์ด"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </label>

      {!wards || wards.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีวอร์ดในระบบ</p>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-base-content/60">
          ไม่พบวอร์ดที่ตรงกับเงื่อนไข
        </p>
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
              {paged.map((ward) => (
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

      <Pagination
        page={page}
        limit={limit}
        totalItems={totalItems}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

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
    </Card>
  )
}
