'use client'

import { useRef, type ReactNode } from 'react'
import { Download, Pencil, Plus, Trash2 } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { useCreateFirmware } from '@/hooks/useCreateFirmware'
import { useDeleteFirmware } from '@/hooks/useDeleteFirmware'
import { useFirmwares } from '@/hooks/useFirmwares'
import { useHydrated } from '@/hooks/useHydrated'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { useUpdateFirmware } from '@/hooks/useUpdateFirmware'
import { getFirmwareDownloadUrl } from '@/lib/api/firmware'
import { canManageDevices } from '@/lib/permissions'
import { formatBytes, formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'

import {
  FirmwareFormDialog,
  type FirmwareFormDialogHandle,
} from './FirmwareFormDialog'

export function FirmwareList() {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageDevices(role)

  const { page, limit, setPage, setLimit } = usePaginationParams()
  const { data: firmwares, isLoading, isError } = useFirmwares({
    page,
    limit,
  })
  // backend ยังไม่คืน meta.total ผ่าน apiClient (unwrapEnvelope ทิ้งไป) — บอกได้แค่
  // ว่ามีหน้าถัดไปหรือไม่จากการที่หน้านี้เต็มจำนวน limit
  const hasNextPage = (firmwares?.length ?? 0) === limit

  const createFirmware = useCreateFirmware()
  const updateFirmware = useUpdateFirmware()
  const deleteFirmware = useDeleteFirmware()

  const formDialogRef = useRef<FirmwareFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')

  const action: ReactNode = canManage && (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={() => formDialogRef.current?.open()}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      อัปโหลดเฟิร์มแวร์
    </button>
  )
  const title = 'เฟิร์มแวร์'
  const description = 'อัปโหลดและจัดการเวอร์ชันเฟิร์มแวร์สำหรับอุปกรณ์'

  if (isLoading)
    return (
      <Card title={title} description={description} action={action}>
        <span className="loading loading-spinner loading-md" />
      </Card>
    )
  if (isError)
    return (
      <Card title={title} description={description} action={action}>
        <p className="text-error">ไม่สามารถโหลดรายการเฟิร์มแวร์ได้</p>
      </Card>
    )

  return (
    <Card title={title} description={description} action={action}>
      <div className="flex flex-col gap-3">
      {!firmwares || firmwares.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีเฟิร์มแวร์ในระบบ</p>
      ) : (
        <div className="overflow-x-auto scrollbar-slim">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>เวอร์ชัน</th>
                <th>ชื่อ</th>
                <th>คำอธิบาย</th>
                <th>ไฟล์</th>
                <th>อัปโหลดเมื่อ</th>
                <th className="text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {firmwares.map((firmware) => (
                <tr key={firmware.id}>
                  <td className="font-mono">{firmware.version}</td>
                  <td className="font-medium">{firmware.name}</td>
                  <td>{firmware.description ?? '-'}</td>
                  <td>
                    <div className="flex flex-col">
                      <span>{firmware.fileName}</span>
                      <span className="text-xs text-base-content/50">
                        {formatBytes(firmware.fileSize)}
                      </span>
                    </div>
                  </td>
                  <td>{formatDateTime(firmware.createAt)}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <a
                        className="btn btn-ghost btn-xs"
                        aria-label={`ดาวน์โหลด ${firmware.name}`}
                        href={getFirmwareDownloadUrl(firmware.version)}
                        download
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                      </a>
                      {canManage && (
                        <>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            aria-label={`แก้ไข ${firmware.name}`}
                            onClick={() =>
                              formDialogRef.current?.open(firmware)
                            }
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-error"
                            aria-label={`ลบ ${firmware.name}`}
                            onClick={() => {
                              targetIdRef.current = firmware.id
                              deleteDialogRef.current?.showModal()
                            }}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </>
                      )}
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
        hasNextPage={hasNextPage}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <FirmwareFormDialog
        ref={formDialogRef}
        isSubmitting={createFirmware.isPending || updateFirmware.isPending}
        onCreate={(dto) => createFirmware.mutate(dto)}
        onUpdate={(id, dto) => updateFirmware.mutate({ id, dto })}
      />

      <ConfirmDialog
        ref={deleteDialogRef}
        title="ยืนยันลบเฟิร์มแวร์"
        description="ไฟล์เฟิร์มแวร์นี้จะถูกลบออกจากระบบถาวร รวมถึงไฟล์ที่เก็บไว้บน object storage"
        confirmLabel="ลบ"
        isLoading={deleteFirmware.isPending}
        onConfirm={() => deleteFirmware.mutate(targetIdRef.current)}
      />
      </div>
    </Card>
  )
}
