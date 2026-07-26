'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { canManageDevices } from '@/lib/permissions'
import { useDeviceAudit } from '@/hooks/useDeviceAudit'

export function DeviceAuditTable({ staticName }: { staticName: string }) {
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = canManageDevices(role)

  const {
    data: audit,
    isLoading,
    isError,
  } = useDeviceAudit(canManage ? staticName : '')

  if (!canManage) {
    return (
      <p className="text-base-content/60">
        ต้องมีสิทธิ์ผู้ดูแลระบบจึงจะดูประวัติการแก้ไขได้
      </p>
    )
  }

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError)
    return <p className="text-error">ไม่สามารถโหลดประวัติการแก้ไขได้</p>
  if (!audit || audit.length === 0)
    return <p className="text-base-content/60">ยังไม่มีประวัติการแก้ไข</p>

  return (
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
  )
}
