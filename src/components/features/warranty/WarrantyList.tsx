'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { Card } from '@/components/ui/Card'
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

function daysRemaining(expire: string): number {
  const end = new Date(expire).getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ expire }: { expire: string }) {
  const days = daysRemaining(expire)
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

  const [keyword, setKeyword] = useState('')
  // debounce คำค้นก่อนยิง request — search เป็น server-side (?search=) แล้ว
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300)
    return () => clearTimeout(timer)
  }, [keyword])
  const [expiringSoon, setExpiringSoon] = useState(false)

  const {
    data: warranties,
    isLoading,
    isError,
  } = useWarranties(canManage, {
    search: debouncedKeyword || undefined,
    expiringSoon: expiringSoon || undefined,
  })
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
  // warranty.devName เป็น free text ที่บันทึกแยกไว้ตอนสร้างรายการ บางรายการเก่าเก็บเป็น ID
  // ภายใน (เช่น "DEVICE-xxxx") จึง map ย้อนกลับผ่าน serial ไปหาอุปกรณ์จริงเพื่อโชว์
  // device.name ปัจจุบันแทนเสมอที่หาเจอ
  const deviceBySerial = useMemo(
    () =>
      new Map(
        (devices ?? [])
          .filter((device) => Boolean(device.serial))
          .map((device) => [device.serial as string, device]),
      ),
    [devices],
  )

  const createWarranty = useCreateWarranty()
  const updateWarranty = useUpdateWarranty()
  const deleteWarranty = useDeleteWarranty()

  const formDialogRef = useRef<WarrantyFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')
  const { page, limit, setPage, setLimit } = usePaginationParams()

  // search/expiringSoon กรองที่ backend แล้ว (ดู useWarranties ด้านบน) เหลือแค่ pagination
  // ฝั่ง client เพราะ getWarranties() ยังดึงมาทั้งชุดผ่าน fetchAllPages
  const filtered = warranties ?? []

  // เปลี่ยนคำค้น/ตัวกรองแล้วต้องกลับไปหน้า 1 เสมอ ไม่งั้นอาจค้างอยู่หน้าที่เกินผลลัพธ์ใหม่
  useEffect(() => {
    if (page !== 1) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword, expiringSoon])

  const totalItems = filtered.length
  const paged = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

  const title = 'รายการประกันอุปกรณ์ทั้งหมด'

  if (!canManage) {
    return (
      <Card title={title}>
        <p className="text-base-content/60">
          ต้องมีสิทธิ์ผู้ดูแลระบบจึงจะดูรายการประกันได้
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
      เพิ่มรายการประกัน
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
        <p className="text-error">ไม่สามารถโหลดรายการประกันได้</p>
      </Card>
    )

  return (
    <Card title={title} action={action}>
      <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="input input-sm input-bordered flex w-full items-center gap-2 sm:max-w-xs">
          <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
          <input
            type="search"
            className="grow"
            placeholder="ค้นหา serial / ชื่ออุปกรณ์ / สินค้า / ลูกค้า"
            aria-label="ค้นหารายการประกัน"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </label>

        <label className="label cursor-pointer gap-2">
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={expiringSoon}
            onChange={(event) => setExpiringSoon(event.target.checked)}
          />
          <span className="label-text">ใกล้หมดประกัน (30 วัน)</span>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-base-content/60">
          ไม่พบรายการที่ตรงกับเงื่อนไข
        </p>
      ) : (
        <div className="overflow-x-auto scrollbar-slim">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>อุปกรณ์</th>
                <th>สินค้า / รุ่น</th>
                <th>ลูกค้า</th>
                <th>วันหมดประกัน</th>
                <th>สถานะ</th>
                <th className="text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((warranty) => {
                const device = deviceBySerial.get(warranty.serial)
                return (
                <tr key={warranty.id}>
                  <td className="font-medium">
                    {device ? (device.name ?? '-') : warranty.serial}
                    <div className="font-mono text-xs text-base-content/50">
                      {warranty.serial}
                    </div>
                  </td>
                  <td>
                    {[warranty.product, warranty.model]
                      .filter(Boolean)
                      .join(' / ') || '-'}
                  </td>
                  <td>{warranty.customerName ?? '-'}</td>
                  <td className="whitespace-nowrap">
                    {new Date(warranty.expire).toLocaleDateString('th-TH')}
                  </td>
                  <td>
                    <ExpiryBadge expire={warranty.expire} />
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
                )
              })}
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
    </Card>
  )
}
