'use client'

import { useRef, type ReactNode } from 'react'
import { Plus } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { useRepairs } from '@/hooks/useRepairs'
import { useCreateRepair } from '@/hooks/useCreateRepair'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { useUpdateRepair } from '@/hooks/useUpdateRepair'
import { useAuthStore } from '@/store/useAuthStore'
import { useHydrated } from '@/hooks/useHydrated'
import { canManageDevices } from '@/lib/permissions'

import {
  RepairFormDialog,
  type RepairFormDialogHandle,
} from './RepairFormDialog'

export function RepairList({ serial }: { serial: string }) {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageDevices(role)

  const { page, limit, setPage, setLimit } = usePaginationParams('repairs')
  const {
    data: repairs,
    isLoading,
    isError,
  } = useRepairs(canManage ? serial : '', { page, limit })
  const hasNextPage = (repairs?.length ?? 0) === limit
  const createRepair = useCreateRepair()
  const updateRepair = useUpdateRepair()
  const formDialogRef = useRef<RepairFormDialogHandle>(null)

  if (!canManage) {
    return (
      <Card title="ประวัติการซ่อม">
        <p className="text-base-content/60">
          ต้องมีสิทธิ์ผู้ดูแลระบบจึงจะดูประวัติการซ่อมได้
        </p>
      </Card>
    )
  }

  const action: ReactNode = (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={() => formDialogRef.current?.open()}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      แจ้งซ่อม
    </button>
  )

  if (isLoading)
    return (
      <Card title="ประวัติการซ่อม" action={action}>
        <span className="loading loading-spinner loading-md" />
      </Card>
    )
  if (isError)
    return (
      <Card title="ประวัติการซ่อม" action={action}>
        <p className="text-error">ไม่สามารถโหลดประวัติการซ่อมได้</p>
      </Card>
    )

  return (
    <Card title="ประวัติการซ่อม" action={action}>
      <div className="flex flex-col gap-3">
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

        <Pagination
          page={page}
          limit={limit}
          hasNextPage={hasNextPage}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

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
    </Card>
  )
}
