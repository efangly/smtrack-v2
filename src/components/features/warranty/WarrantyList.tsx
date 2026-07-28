'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'

import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { useCreateWarranty } from '@/hooks/useCreateWarranty'
import { useDeleteWarranty } from '@/hooks/useDeleteWarranty'
import { useUpdateWarranty } from '@/hooks/useUpdateWarranty'
import { useWarranties } from '@/hooks/useWarranties'
import { useDevices } from '@/hooks/useDevices'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { canManageDevices } from '@/lib/permissions'
import { useAuthStore } from '@/store/useAuthStore'
import { useHydrated } from '@/hooks/useHydrated'

import {
  WarrantyFormDialog,
  type WarrantyFormDialogHandle,
} from './WarrantyFormDialog'

function daysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ endDate }: { endDate: string }) {
  const days = daysRemaining(endDate)
  if (days < 0)
    return <span className="badge badge-error badge-sm">หมดประกันแล้ว</span>
  if (days <= 30)
    return <span className="badge badge-warning badge-sm">อีก {days} วัน</span>
  return <span className="badge badge-success badge-sm">อีก {days} วัน</span>
}

export function WarrantyList() {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageDevices(role)

  const { data: warranties, isLoading, isError } = useWarranties(canManage)
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

  const createWarranty = useCreateWarranty()
  const updateWarranty = useUpdateWarranty()
  const deleteWarranty = useDeleteWarranty()

  const formDialogRef = useRef<WarrantyFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')
  const [keyword, setKeyword] = useState('')
  const { page, limit, setPage, setLimit } = usePaginationParams()

  const filtered = useMemo(() => {
    if (!warranties) return []
    const needle = keyword.trim().toLowerCase()
    if (!needle) return warranties

    return warranties.filter((warranty) =>
      [warranty.serial, warranty.devName, warranty.provider]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle)),
    )
  }, [warranties, keyword])

  // เปลี่ยนคำค้นแล้วต้องกลับไปหน้า 1 เสมอ ไม่งั้นอาจค้างอยู่หน้าที่เกินผลลัพธ์ใหม่
  useEffect(() => {
    if (page !== 1) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

  const totalItems = filtered.length
  const paged = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

  if (!canManage) {
    return (
      <p className="text-base-content/60">
        ต้องมีสิทธิ์ผู้ดูแลระบบจึงจะดูรายการประกันได้
      </p>
    )
  }

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดรายการประกันได้</p>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="input input-sm input-bordered flex w-full items-center gap-2 sm:max-w-xs">
          <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
          <input
            type="search"
            className="grow"
            placeholder="ค้นหา serial / ชื่ออุปกรณ์ / ผู้ให้บริการ"
            aria-label="ค้นหารายการประกัน"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </label>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => formDialogRef.current?.open()}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          เพิ่มรายการประกัน
        </button>
      </div>

      {!warranties || warranties.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีรายการประกันในระบบ</p>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-base-content/60">
          ไม่พบรายการที่ตรงกับเงื่อนไข
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>อุปกรณ์</th>
                <th>ผู้ให้บริการ</th>
                <th>ช่วงเวลาประกัน</th>
                <th>สถานะ</th>
                <th className="text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((warranty) => (
                <tr key={warranty.id}>
                  <td className="font-medium">
                    {warranty.devName ?? warranty.serial}
                    <div className="font-mono text-xs text-base-content/50">
                      {warranty.serial}
                    </div>
                  </td>
                  <td>{warranty.provider ?? '-'}</td>
                  <td className="whitespace-nowrap">
                    {new Date(warranty.startDate).toLocaleDateString('th-TH')}
                    {' – '}
                    {new Date(warranty.endDate).toLocaleDateString('th-TH')}
                  </td>
                  <td>
                    <ExpiryBadge endDate={warranty.endDate} />
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        aria-label={`แก้ไขรายการประกัน ${warranty.serial}`}
                        onClick={() => formDialogRef.current?.open(warranty)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-error"
                        aria-label={`ลบรายการประกัน ${warranty.serial}`}
                        onClick={() => {
                          targetIdRef.current = warranty.id
                          deleteDialogRef.current?.showModal()
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
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
        totalItems={totalItems}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <WarrantyFormDialog
        ref={formDialogRef}
        serialOptions={serialOptions}
        isSubmitting={createWarranty.isPending || updateWarranty.isPending}
        onSubmit={(id, dto) => {
          if (id) {
            updateWarranty.mutate({ id, dto })
          } else {
            createWarranty.mutate(dto)
          }
        }}
      />

      <ConfirmDialog
        ref={deleteDialogRef}
        title="ยืนยันลบรายการประกัน"
        description="รายการประกันนี้จะถูกลบออกจากระบบ"
        confirmLabel="ลบ"
        isLoading={deleteWarranty.isPending}
        onConfirm={() => deleteWarranty.mutate(targetIdRef.current)}
      />
    </div>
  )
}
