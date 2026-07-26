'use client'

import { useRef } from 'react'
import { Plus } from 'lucide-react'

import { useRepairs } from '@/hooks/useRepairs'
import { useCreateRepair } from '@/hooks/useCreateRepair'
import { useUpdateRepair } from '@/hooks/useUpdateRepair'
import { useAuthStore } from '@/store/useAuthStore'
import { canManageDevices } from '@/lib/permissions'

import {
  RepairFormDialog,
  type RepairFormDialogHandle,
} from './RepairFormDialog'

export function RepairList({ serial }: { serial: string }) {
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = canManageDevices(role)

  const { data: repairs, isLoading, isError } = useRepairs(
    canManage ? serial : '',
  )
  const createRepair = useCreateRepair(serial)
  const updateRepair = useUpdateRepair(serial)
  const formDialogRef = useRef<RepairFormDialogHandle>(null)

  if (!canManage) {
    return (
      <p className="text-base-content/60">
        ต้องมีสิทธิ์ผู้ดูแลระบบจึงจะดูประวัติการซ่อมได้
      </p>
    )
  }

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดประวัติการซ่อมได้</p>

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="btn btn-primary btn-sm self-start"
        onClick={() => formDialogRef.current?.open()}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        แจ้งซ่อม
      </button>

      {!repairs || repairs.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีประวัติการซ่อม</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>รายละเอียด</th>
                <th>ผู้แจ้ง</th>
                <th>สถานะ</th>
                <th className="text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((repair) => (
                <tr key={repair.id}>
                  <td>{repair.seq}</td>
                  <td>{repair.detail ?? repair.info ?? '-'}</td>
                  <td>{repair.phone ?? '-'}</td>
                  <td>{repair.status ?? '-'}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => formDialogRef.current?.open(repair)}
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RepairFormDialog
        ref={formDialogRef}
        isSubmitting={createRepair.isPending || updateRepair.isPending}
        onSubmit={(id, dto) => {
          if (id) {
            updateRepair.mutate({ id, dto })
          } else {
            createRepair.mutate({ ...dto, serial })
          }
        }}
      />
    </div>
  )
}
