'use client'

import { useMemo, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import {
  RepairFormDialog,
  type RepairFormDialogHandle,
} from '@/components/features/devices/RepairFormDialog'
import { useRepairsList } from '@/hooks/useRepairsList'
import { useCreateRepair } from '@/hooks/useCreateRepair'
import { useUpdateRepair } from '@/hooks/useUpdateRepair'
import { useDeleteRepair } from '@/hooks/useDeleteRepair'
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
          devName: device.name ?? '-',
          label: `${device.name ?? '-'} (${device.serial})`,
        })),
    [devices],
  )
  // ตาราง repair เก็บ serial/devName เป็น free text แยกจากอุปกรณ์จริง — devName ที่
  // บันทึกไว้เก่า ๆ บางรายการมีค่าเป็น ID ภายใน (เช่น "DEVICE-xxxx") จึงต้อง map ย้อนกลับ
  // ผ่าน serial ไปหาอุปกรณ์จริงเพื่อโชว์ device.name ปัจจุบันแทนเสมอที่หาเจอ
  const deviceBySerial = useMemo(
    () =>
      new Map(
        (devices ?? [])
          .filter((device) => Boolean(device.serial))
          .map((device) => [device.serial as string, device]),
      ),
    [devices],
  )

  const createRepair = useCreateRepair()
  const updateRepair = useUpdateRepair()
  const deleteRepair = useDeleteRepair()
  const formDialogRef = useRef<RepairFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')

  const title = 'รายการแจ้งซ่อมทั้งหมด'

  if (!canManage) {
    return (
      <Card title={title}>
        <p className="text-base-content/60">
          ต้องมีสิทธิ์ผู้ดูแลระบบจึงจะดูรายการแจ้งซ่อมได้
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
      <Card title={title} action={action}>
        <span className="loading loading-spinner loading-md" />
      </Card>
    )
  if (isError)
    return (
      <Card title={title} action={action}>
        <p className="text-error">ไม่สามารถโหลดรายการแจ้งซ่อมได้</p>
      </Card>
    )

  return (
    <Card title={title} action={action}>
      <div className="flex flex-col gap-3">
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
                const device = deviceBySerial.get(repair.serial)
                return (
                  <tr key={repair.id}>
                    <td>{repair.seq}</td>
                    <td>
                      {device ? (
                        <>
                          <Link
                            href={`/devices/${encodeURIComponent(device.staticName)}`}
                            className="link link-hover"
                          >
                            {device.name ?? '-'}
                          </Link>
                          <div className="font-mono text-xs text-base-content/50">
                            {repair.serial}
                          </div>
                        </>
                      ) : (
                        (repair.serial ?? '-')
                      )}
                    </td>
                    <td>{repair.detail ?? repair.info ?? '-'}</td>
                    <td>{repair.phone ?? '-'}</td>
                    <td>{repair.status ?? '-'}</td>
                    <td>{repair.warrantyStatus ?? '-'}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => formDialogRef.current?.open(repair)}
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          aria-label={`ลบรายการแจ้งซ่อม #${repair.seq}`}
                          onClick={() => {
                            targetIdRef.current = repair.id
                            deleteDialogRef.current?.showModal()
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
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

      <ConfirmDialog
        ref={deleteDialogRef}
        title="ยืนยันลบรายการแจ้งซ่อม"
        description="รายการแจ้งซ่อมนี้จะถูกลบออกจากระบบ"
        confirmLabel="ลบ"
        isLoading={deleteRepair.isPending}
        onConfirm={() => deleteRepair.mutate(targetIdRef.current)}
      />
      </div>
    </Card>
  )
}
