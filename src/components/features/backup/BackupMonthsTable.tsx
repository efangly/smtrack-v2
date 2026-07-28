'use client'

import { useRef } from 'react'

import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { useBackupMonths } from '@/hooks/useBackupMonths'
import { useExportMonth } from '@/hooks/useExportMonth'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { useRestoreMonth } from '@/hooks/useRestoreMonth'
import { useRemoveRestore } from '@/hooks/useRemoveRestore'
import { formatBytes } from '@/lib/utils'

export function BackupMonthsTable() {
  const { page, limit, setPage, setLimit } = usePaginationParams()
  const { data, isLoading, isError } = useBackupMonths({ page, limit })
  const hasNextPage = (data?.length ?? 0) === limit
  const exportMonth = useExportMonth()
  const restoreMonth = useRestoreMonth()
  const removeRestore = useRemoveRestore()

  const exportDialogRef = useRef<ConfirmDialogHandle>(null)
  const restoreDialogRef = useRef<ConfirmDialogHandle>(null)
  const removeDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetMonthRef = useRef<string>('')

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError)
    return <p className="text-error">ไม่สามารถโหลดรายการ backup ได้</p>
  if (!data || data.length === 0) {
    // หน้าหลังๆ อาจว่างได้ถ้า backend คืนหน้าว่างมา — ต้องยังกด "ก่อนหน้า" กลับไปได้
    return (
      <div className="flex flex-col gap-3">
        <p className="text-base-content/60">ยังไม่มีข้อมูล backup</p>
        <Pagination
          page={page}
          limit={limit}
          hasNextPage={hasNextPage}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>เดือน</th>
            <th>ขนาด</th>
            <th>สถานะ restore</th>
            <th className="text-right">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.month}>
              <td>{item.month}</td>
              <td>{formatBytes(item.sizeBytes)}</td>
              <td>
                <Badge tone={item.restored ? 'success' : 'neutral'}>
                  {item.restored ? 'restored' : 'archived'}
                </Badge>
              </td>
              <td>
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      targetMonthRef.current = item.month
                      exportDialogRef.current?.showModal()
                    }}
                  >
                    Export
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={item.restored}
                    onClick={() => {
                      targetMonthRef.current = item.month
                      restoreDialogRef.current?.showModal()
                    }}
                  >
                    Restore
                  </button>
                  <button
                    className="btn btn-sm btn-error btn-outline"
                    disabled={!item.restored}
                    onClick={() => {
                      targetMonthRef.current = item.month
                      removeDialogRef.current?.showModal()
                    }}
                  >
                    ลบ restore
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        page={page}
        limit={limit}
        hasNextPage={hasNextPage}
        onPageChange={setPage}
        onLimitChange={setLimit}
        className="mt-3"
      />

      <ConfirmDialog
        ref={exportDialogRef}
        title="ยืนยัน Export"
        description="ต้องการ export ข้อมูลเดือนนี้ไปยัง object storage หรือไม่?"
        confirmLabel="Export"
        isLoading={exportMonth.isPending}
        onConfirm={() => exportMonth.mutate(targetMonthRef.current)}
      />
      <ConfirmDialog
        ref={restoreDialogRef}
        title="ยืนยัน Restore"
        description="ต้องการดึงข้อมูลเดือนนี้กลับมาในฐานข้อมูลหลักเพื่อทำรายงานหรือไม่?"
        confirmLabel="Restore"
        isLoading={restoreMonth.isPending}
        onConfirm={() => restoreMonth.mutate(targetMonthRef.current)}
      />
      <ConfirmDialog
        ref={removeDialogRef}
        title="ยืนยันลบข้อมูลที่ restore"
        description="ข้อมูลที่ restore แล้วจะถูกลบออกจากฐานข้อมูลหลัก (สำเนาใน object storage ยังคงอยู่)"
        confirmLabel="ลบ"
        isLoading={removeRestore.isPending}
        onConfirm={() => removeRestore.mutate(targetMonthRef.current)}
      />
    </div>
  )
}
