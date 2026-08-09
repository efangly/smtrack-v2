'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { useCreateHospital } from '@/hooks/useCreateHospital'
import { useDeleteHospital } from '@/hooks/useDeleteHospital'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import { useHospitals } from '@/hooks/useHospitals'
import { useUpdateHospital } from '@/hooks/useUpdateHospital'
import { HOS_TYPE_LABELS } from '@/lib/api/hospitals'
import { canDeleteHospital, canManageHospitals } from '@/lib/permissions'
import { useAuthStore } from '@/store/useAuthStore'
import { useHydrated } from '@/hooks/useHydrated'

import {
  HospitalFormDialog,
  type HospitalFormDialogHandle,
} from './HospitalFormDialog'

export function HospitalList() {
  const hydrated = useHydrated()
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = hydrated && canManageHospitals(role)
  const canDelete = hydrated && canDeleteHospital(role)

  const { data: hospitals, isLoading, isError } = useHospitals()
  const createHospital = useCreateHospital()
  const updateHospital = useUpdateHospital()
  const deleteHospital = useDeleteHospital()

  const formDialogRef = useRef<HospitalFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')
  const [keyword, setKeyword] = useState('')
  const { page, limit, setPage, setLimit } = usePaginationParams()

  const filtered = useMemo(() => {
    if (!hospitals) return []
    const needle = keyword.trim().toLowerCase()
    if (!needle) return hospitals

    return hospitals.filter((hospital) =>
      [hospital.hosName, hospital.userContact, hospital.userTel]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle)),
    )
  }, [hospitals, keyword])

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
      เพิ่มโรงพยาบาล
    </button>
  )
  const title = 'รายการโรงพยาบาลทั้งหมด'

  if (isLoading)
    return (
      <Card title={title} action={action}>
        <span className="loading loading-spinner loading-md" />
      </Card>
    )
  if (isError)
    return (
      <Card title={title} action={action}>
        <p className="text-error">ไม่สามารถโหลดรายการโรงพยาบาลได้</p>
      </Card>
    )

  return (
    <Card title={title} action={action}>
      <div className="flex flex-col gap-3">
      <label className="input input-sm input-bordered flex w-full items-center gap-2 sm:max-w-xs">
        <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
        <input
          type="search"
          className="grow"
          placeholder="ค้นหาชื่อโรงพยาบาล / ผู้ติดต่อ"
          aria-label="ค้นหาโรงพยาบาล"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </label>

      {!hospitals || hospitals.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีโรงพยาบาลในระบบ</p>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-base-content/60">
          ไม่พบโรงพยาบาลที่ตรงกับเงื่อนไข
        </p>
      ) : (
        <div className="overflow-x-auto scrollbar-slim">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อโรงพยาบาล</th>
                <th>ประเภท</th>
                <th>จำนวนวอร์ด</th>
                <th>ผู้ติดต่อ</th>
                {canManage && <th className="text-right">การจัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {paged.map((hospital) => (
                <tr key={hospital.id}>
                  <td>{hospital.hosSeq}</td>
                  <td className="font-medium">{hospital.hosName}</td>
                  <td>{HOS_TYPE_LABELS[hospital.hosType]}</td>
                  <td>{hospital.ward?.length ?? 0}</td>
                  {/* ข้อมูลติดต่ออาจมีแค่ชื่อ แค่เบอร์ หรือไม่มีเลย — ประกอบเฉพาะส่วนที่มีจริง
                      ไม่งั้นจะได้ข้อความแปลกๆ อย่าง "- (02 791 4500)" */}
                  <td>
                    {[hospital.userContact, hospital.userTel]
                      .filter(Boolean)
                      .join(' · ') || '-'}
                  </td>
                  {canManage && (
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          aria-label={`แก้ไข ${hospital.hosName}`}
                          onClick={() => formDialogRef.current?.open(hospital)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-error"
                            aria-label={`ลบ ${hospital.hosName}`}
                            onClick={() => {
                              targetIdRef.current = hospital.id
                              deleteDialogRef.current?.showModal()
                            }}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
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

      <HospitalFormDialog
        ref={formDialogRef}
        isSubmitting={createHospital.isPending || updateHospital.isPending}
        onSubmit={(id, dto) => {
          if (id) {
            updateHospital.mutate({ id, dto })
          } else {
            createHospital.mutate(dto)
          }
        }}
      />

      <ConfirmDialog
        ref={deleteDialogRef}
        title="ยืนยันลบโรงพยาบาล"
        description="โรงพยาบาลนี้จะถูกลบออกจากระบบพร้อมความเชื่อมโยงกับวอร์ดที่อยู่ภายใต้"
        confirmLabel="ลบ"
        isLoading={deleteHospital.isPending}
        onConfirm={() => deleteHospital.mutate(targetIdRef.current)}
      />
      </div>
    </Card>
  )
}
