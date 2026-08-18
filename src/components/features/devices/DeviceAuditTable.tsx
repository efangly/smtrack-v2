'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useHydrated } from '@/hooks/useHydrated'
import { canManageDevices } from '@/lib/permissions'
import { useDeviceAudit } from '@/hooks/useDeviceAudit'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import type { FieldDiff } from '@/lib/api/deviceAudit'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'

function formatDiffValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function DiffCell({ diff }: { diff: FieldDiff | null }) {
  if (diff === null) {
    return <span className="text-base-content/50">สร้างอุปกรณ์</span>
  }

  const fields = Object.entries(diff)
  if (fields.length === 0) {
    return <span className="text-base-content/50">ไม่มีการเปลี่ยนแปลงข้อมูล</span>
  }

  return (
    <details className="w-full">
      <summary className="cursor-pointer text-sm text-primary select-none">
        ดูการเปลี่ยนแปลง ({fields.length})
      </summary>
      <div className="mt-2 flex flex-col gap-2">
        {fields.map(([field, { from, to }]) => {
          const fromText = formatDiffValue(from)
          const toText = formatDiffValue(to)
          const isMultiline = fromText.includes('\n') || toText.includes('\n')
          return (
            <div key={field} className="rounded-box bg-base-200 p-2 text-xs">
              <div className="mb-1 font-medium">{field}</div>
              <div className="flex flex-wrap items-start gap-1">
                <Badge tone="error">จาก</Badge>
                {isMultiline ? (
                  <pre className="scrollbar-slim max-w-full overflow-x-auto rounded bg-base-300 p-1">
                    {fromText}
                  </pre>
                ) : (
                  <span className="break-all">{fromText}</span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-start gap-1">
                <Badge tone="success">เป็น</Badge>
                {isMultiline ? (
                  <pre className="scrollbar-slim max-w-full overflow-x-auto rounded bg-base-300 p-1">
                    {toText}
                  </pre>
                ) : (
                  <span className="break-all">{toText}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </details>
  )
}

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
        <div className="overflow-x-auto scrollbar-slim">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>เวลา</th>
                <th>การกระทำ</th>
                <th>ผู้ดำเนินการ</th>
                <th>การเปลี่ยนแปลง</th>
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
                  <td>
                    <DiffCell diff={entry.diff} />
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
