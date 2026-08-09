'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Pencil, Plus, Search } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { useCreateDevice } from '@/hooks/useCreateDevice'
import { useDevices } from '@/hooks/useDevices'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { useUpdateDevice } from '@/hooks/useUpdateDevice'
import { canManageDevices } from '@/lib/permissions'
import { useAuthStore } from '@/store/useAuthStore'
import { useHydrated } from '@/hooks/useHydrated'

import {
  DeviceFormDialog,
  type DeviceFormDialogHandle,
} from './DeviceFormDialog'

export function DeviceSettingsList() {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageDevices(role)

  const { data: devices, isLoading, isError } = useDevices()
  const createDevice = useCreateDevice()
  const updateDevice = useUpdateDevice()

  const formDialogRef = useRef<DeviceFormDialogHandle>(null)
  const [keyword, setKeyword] = useState('')
  const { page, limit, setPage, setLimit } = usePaginationParams()

  const filtered = useMemo(() => {
    if (!devices) return []
    const needle = keyword.trim().toLowerCase()
    if (!needle) return devices

    return devices.filter((device) =>
      [device.serial, device.staticName, device.name, device.ward]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle)),
    )
  }, [devices, keyword])

  // เปลี่ยนคำค้นแล้วต้องกลับไปหน้า 1 เสมอ ไม่งั้นอาจค้างอยู่หน้าที่เกินผลลัพธ์ใหม่
  useEffect(() => {
    if (page !== 1) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword])

  const totalItems = filtered.length
  const paged = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

  const action: ReactNode = canManage && (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={() => formDialogRef.current?.open()}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      เพิ่มอุปกรณ์
    </button>
  )
  const title = 'ทะเบียนอุปกรณ์'
  const description = 'เพิ่มและแก้ไขข้อมูลจุดติดตั้ง — ดูสถานะการทำงานได้ที่เมนูอุปกรณ์'

  if (isLoading)
    return (
      <Card title={title} description={description} action={action}>
        <span className="loading loading-spinner loading-md" />
      </Card>
    )
  if (isError)
    return (
      <Card title={title} description={description} action={action}>
        <p className="text-error">ไม่สามารถโหลดทะเบียนอุปกรณ์ได้</p>
      </Card>
    )

  return (
    <Card title={title} description={description} action={action}>
      <div className="flex flex-col gap-3">
      <label className="input input-sm input-bordered flex w-full items-center gap-2 sm:max-w-xs">
        <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
        <input
          type="search"
          className="grow"
          placeholder="ค้นหา serial / ชื่ออุปกรณ์"
          aria-label="ค้นหาในทะเบียนอุปกรณ์"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </label>

      {!devices || devices.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีอุปกรณ์ในทะเบียน</p>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-base-content/60">
          ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข
        </p>
      ) : (
        <div className="overflow-x-auto scrollbar-slim">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Serial</th>
                <th>ชื่ออุปกรณ์</th>
                <th>Firmware</th>
                <th>สถานะ</th>
                {canManage && <th className="text-right">การจัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {paged.map((device) => (
                <tr key={device.id}>
                  <td className="font-mono">{device.serial ?? '-'}</td>
                  <td className="font-medium">{device.name ?? '-'}</td>
                  <td>{device.hardware?.firmware ?? '-'}</td>
                  <td>
                    <Badge tone={device.status ? 'success' : 'neutral'}>
                      {device.status ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </td>
                  {canManage && (
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        aria-label={`แก้ไข ${device.name ?? '-'}`}
                        onClick={() => formDialogRef.current?.open(device)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  )}
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

      <DeviceFormDialog
        ref={formDialogRef}
        isSubmitting={createDevice.isPending || updateDevice.isPending}
        onCreate={(dto) => createDevice.mutate(dto)}
        onUpdate={(id, dto) => updateDevice.mutate({ id, dto })}
      />
      </div>
    </Card>
  )
}
