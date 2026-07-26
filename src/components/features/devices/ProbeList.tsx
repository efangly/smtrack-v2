'use client'

import { useRef } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { useProbes } from '@/hooks/useProbes'
import { useCreateProbe } from '@/hooks/useCreateProbe'
import { useUpdateProbe } from '@/hooks/useUpdateProbe'
import { useDeleteProbe } from '@/hooks/useDeleteProbe'
import { useAuthStore } from '@/store/useAuthStore'
import { canManageDevices } from '@/lib/permissions'

import { ProbeFormDialog, type ProbeFormDialogHandle } from './ProbeFormDialog'

export function ProbeList({ deviceId }: { deviceId: string }) {
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = canManageDevices(role)

  const { data: probes, isLoading, isError } = useProbes(deviceId)
  const createProbe = useCreateProbe(deviceId)
  const updateProbe = useUpdateProbe(deviceId)
  const deleteProbe = useDeleteProbe(deviceId)

  const formDialogRef = useRef<ProbeFormDialogHandle>(null)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)
  const targetIdRef = useRef<string>('')

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError) return <p className="text-error">ไม่สามารถโหลดรายการโพรบได้</p>

  return (
    <div className="flex flex-col gap-3">
      {canManage && (
        <button
          type="button"
          className="btn btn-primary btn-sm self-start"
          onClick={() => formDialogRef.current?.open()}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          เพิ่มโพรบ
        </button>
      )}

      {!probes || probes.length === 0 ? (
        <p className="text-base-content/60">ยังไม่มีโพรบสำหรับอุปกรณ์นี้</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>ประเภท</th>
                <th>Channel</th>
                <th>ช่วงอุณหภูมิ</th>
                <th>ช่วงความชื้น</th>
                {canManage && <th className="text-right">การจัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {probes.map((probe) => (
                <tr key={probe.id}>
                  <td>{probe.name ?? '-'}</td>
                  <td>{probe.type ?? '-'}</td>
                  <td>{probe.channel ?? '-'}</td>
                  <td>
                    {probe.tempMin ?? '-'} / {probe.tempMax ?? '-'}
                  </td>
                  <td>
                    {probe.humiMin ?? '-'} / {probe.humiMax ?? '-'}
                  </td>
                  {canManage && (
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          aria-label={`แก้ไข ${probe.name ?? probe.id}`}
                          onClick={() => formDialogRef.current?.open(probe)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          aria-label={`ลบ ${probe.name ?? probe.id}`}
                          onClick={() => {
                            targetIdRef.current = probe.id
                            deleteDialogRef.current?.showModal()
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProbeFormDialog
        ref={formDialogRef}
        isSubmitting={createProbe.isPending || updateProbe.isPending}
        onSubmit={(id, dto) => {
          if (id) {
            updateProbe.mutate({ id, dto })
          } else {
            createProbe.mutate(dto)
          }
        }}
      />

      <ConfirmDialog
        ref={deleteDialogRef}
        title="ยืนยันลบโพรบ"
        description="โพรบนี้จะถูกลบออกจากอุปกรณ์"
        confirmLabel="ลบ"
        isLoading={deleteProbe.isPending}
        onConfirm={() => deleteProbe.mutate(targetIdRef.current)}
      />
    </div>
  )
}
