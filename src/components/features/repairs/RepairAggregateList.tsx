'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Pagination } from '@/components/ui/Pagination'
import {
  RepairFormDialog,
  type RepairFormDialogHandle,
} from '@/components/features/devices/RepairFormDialog'
import { useRepairsList } from '@/hooks/useRepairsList'
import { useCreateRepair } from '@/hooks/useCreateRepair'
import { useUpdateRepair } from '@/hooks/useUpdateRepair'
import { useDevices } from '@/hooks/useDevices'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { useAuthStore } from '@/store/useAuthStore'
import { useHydrated } from '@/hooks/useHydrated'
import { canManageDevices } from '@/lib/permissions'

export function RepairAggregateList() {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageDevices(role)

  const { page, limit, setPage, setLimit } = usePaginationParams()
  const {
    data: repairs,
    isLoading,
    isError,
  } = useRepairsList({ page, limit }, canManage)
  const hasNextPage = (repairs?.length ?? 0) === limit

  const { data: devices } = useDevices()
  const serialOptions = useMemo(
    () =>
      (devices ?? [])
        .filter((device): device is typeof device & { serial: string } =>
          Boolean(device.serial),
        )
        .map((device) => ({
          serial: device.serial,
          devName: device.name ?? device.staticName,
          label: `${device.staticName} (${device.serial})`,
        })),
    [devices],
  )
  // ตาราง repair เก็บแค่ serial/devName (free text) ไม่มี staticName — ต้อง map
  // ย้อนกลับผ่าน serial เพื่อลิงก์ไปหน้ารายละเอียดอุปกรณ์ (route ใช้ staticName)
  const staticNameBySerial = useMemo(
    () =>
      new Map(
        (devices ?? [])
          .filter((device) => Boolean(device.serial))
          .map((device) => [device.serial as string, device.staticName]),
      ),
    [devices],
  )

  const createRepair = useCreateRepair()
  const updateRepair = useUpdateRepair()
  const formDialogRef = useRef<RepairFormDialogHandle>(null)

  if (!canManage) {
    return (
      <p className="text-base-content/60">
        ต้องมีสิทธิ์ผู้ดูแลระบบจึงจะดูรายการแจ้งซ่อมได้
      </p>
    )
  }

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError)
    return <p className="text-error">ไม่สามารถโหลดรายการแจ้งซ่อมได้</p>

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
        <p className="text-base-content/60">ยังไม่มีรายการแจ้งซ่อม</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>อุปกรณ์</th>
                <th>รายละเอียด</th>
                <th>ผู้แจ้ง</th>
                <th>สถานะ</th>
                <th>สถานะรับประกัน</th>
                <th className="text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((repair) => {
                const staticName = staticNameBySerial.get(repair.serial)
                return (
                  <tr key={repair.id}>
                    <td>{repair.seq}</td>
                    <td>
                      {staticName ? (
                        <Link
                          href={`/devices/${encodeURIComponent(staticName)}`}
                          className="link link-hover"
                        >
                          {repair.devName ?? staticName}
                        </Link>
                      ) : (
                        (repair.devName ?? repair.serial)
                      )}
                    </td>
                    <td>{repair.detail ?? repair.info ?? '-'}</td>
                    <td>{repair.phone ?? '-'}</td>
                    <td>{repair.status ?? '-'}</td>
                    <td>{repair.warrantyStatus ?? '-'}</td>
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
                )
              })}
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
        showSerialField
        serialOptions={serialOptions}
        isSubmitting={createRepair.isPending || updateRepair.isPending}
        onSubmit={(id, dto) => {
          if (id) {
            updateRepair.mutate({ id, dto })
          } else {
            createRepair.mutate({ ...dto, serial: dto.serial ?? '' })
          }
        }}
      />
    </div>
  )
}
