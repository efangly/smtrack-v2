'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useHydrated } from '@/hooks/useHydrated'
import { canManageDevices } from '@/lib/permissions'
import { useDeviceAudit } from '@/hooks/useDeviceAudit'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'

export function DeviceAuditTable({ staticName }: { staticName: string }) {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageDevices(role)

  const { page, limit, setPage, setLimit } = usePaginationParams('audit')
  const {
    data: audit,
    isLoading,
    isError,
  } = useDeviceAudit(canManage ? staticName : '', { page, limit })
  const hasNextPage = (audit?.length ?? 0) === limit

  if (!canManage) {
    return (
      <Card title="ประวัติการแก้ไข">
        <p className="text-base-content/60">
          ต้องมีสิทธิ์ผู้ดูแลระบบจึงจะดูประวัติการแก้ไขได้
        </p>
      </Card>
    )
  }

  if (isLoading)
    return (
      <Card title="ประวัติการแก้ไข">
        <span className="loading loading-spinner loading-md" />
      </Card>
    )
  if (isError)
    return (
      <Card title="ประวัติการแก้ไข">
        <p className="text-error">ไม่สามารถโหลดประวัติการแก้ไขได้</p>
      </Card>
    )
  if (!audit || audit.length === 0)
    return (
      <Card title="ประวัติการแก้ไข">
        <p className="text-base-content/60">ยังไม่มีประวัติการแก้ไข</p>
      </Card>
    )

  return (
    <Card title="ประวัติการแก้ไข">
      <div className="flex flex-col gap-3">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>เวลา</th>
                <th>การกระทำ</th>
                <th>ผู้ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap">
                    {new Date(entry.createAt).toLocaleString('th-TH')}
                  </td>
                  <td>{entry.action}</td>
                  <td>
                    {entry.actorName ?? entry.actorId ?? '-'}
                    {entry.actorRole && (
                      <span className="ml-1 text-xs text-base-content/50">
                        ({entry.actorRole})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={limit}
          hasNextPage={hasNextPage}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </Card>
  )
}
