'use client'

import { useRef } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { useCreateHospital } from '@/hooks/useCreateHospital'
import { useDeleteHospital } from '@/hooks/useDeleteHospital'
import { useHospitals } from '@/hooks/useHospitals'
import { useUpdateHospital } from '@/hooks/useUpdateHospital'
import { HOS_TYPE_LABELS } from '@/lib/api/hospitals'
import { canDeleteHospital, canManageHospitals } from '@/lib/permissions'
import { useAuthStore } from '@/store/useAuthStore'

import {
  HospitalFormDialog,
  type HospitalFormDialogHandle,
} from './HospitalFormDialog'

export function HospitalList() {
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = canManageHospitals(role)
  const canDelete = canDeleteHospital(role)

  const { data: hospitals, isLoading, isError } = useHospitals()
  const createHospital = useCreateHospital()
  const updateHospital = useUpdateHospital()
  const deleteHospital = useDeleteHospital()

  const formDialogRef = useRef<HospitalFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError)
    return <p className="text-error">ไม่สามารถโหลดรายการโรงพยาบาลได้</p>

  return (
    <div className="flex flex-col gap-3">
      {canManage && (
        <button
          type="button"
          className="btn btn-primary btn-sm self-start"
          onClick={() => formDialogRef.current?.open()}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          เพิ่มโรงพยาบาล
        </button>
      )}

      {!hospitals || hospitals.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีโรงพยาบาลในระบบ</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
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
              {hospitals.map((hospital) => (
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
  )
}
