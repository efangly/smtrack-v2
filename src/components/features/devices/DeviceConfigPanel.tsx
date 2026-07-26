'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Trash2 } from 'lucide-react'

import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/ui/ConfirmDialog'
import { useDeviceConfig } from '@/hooks/useDeviceConfig'
import { useUpsertDeviceConfig } from '@/hooks/useUpsertDeviceConfig'
import { useDeleteDeviceConfig } from '@/hooks/useDeleteDeviceConfig'
import { useAuthStore } from '@/store/useAuthStore'
import { canManageDevices } from '@/lib/permissions'
import { ApiError } from '@/lib/apiClient'
import type { DeviceConfigInput } from '@/lib/api/deviceConfig'

const TEXT_FIELDS: { key: keyof DeviceConfigInput; label: string }[] = [
  { key: 'ip', label: 'IP (Wi-Fi)' },
  { key: 'mac', label: 'MAC (Wi-Fi)' },
  { key: 'subnet', label: 'Subnet (Wi-Fi)' },
  { key: 'gateway', label: 'Gateway (Wi-Fi)' },
  { key: 'dns', label: 'DNS (Wi-Fi)' },
  { key: 'ipEth', label: 'IP (Ethernet)' },
  { key: 'macEth', label: 'MAC (Ethernet)' },
  { key: 'subnetEth', label: 'Subnet (Ethernet)' },
  { key: 'gatewayEth', label: 'Gateway (Ethernet)' },
  { key: 'dnsEth', label: 'DNS (Ethernet)' },
  { key: 'ssid', label: 'Wi-Fi SSID' },
  { key: 'password', label: 'Wi-Fi Password' },
  { key: 'simSP', label: 'SIM ผู้ให้บริการ' },
  { key: 'email1', label: 'อีเมลแจ้งเตือน 1' },
  { key: 'email2', label: 'อีเมลแจ้งเตือน 2' },
  { key: 'email3', label: 'อีเมลแจ้งเตือน 3' },
  { key: 'hardReset', label: 'Hard reset' },
]

export function DeviceConfigPanel({ deviceId }: { deviceId: string }) {
  const role = useAuthStore((state) => state.payload?.role)
  const canManage = canManageDevices(role)

  const { data: config, isLoading, isError, error } = useDeviceConfig(deviceId)
  const notFound = error instanceof ApiError && error.statusCode === 404

  const upsert = useUpsertDeviceConfig(deviceId, Boolean(config))
  const remove = useDeleteDeviceConfig(deviceId)
  const deleteDialogRef = useRef<ConfirmDialogHandle>(null)

  const { register, handleSubmit, reset } = useForm<DeviceConfigInput>({
    defaultValues: {},
  })

  useEffect(() => {
    if (config) {
      reset(
        Object.fromEntries(
          Object.entries(config).map(([key, value]) => [
            key,
            value ?? undefined,
          ]),
        ) as DeviceConfigInput,
      )
    }
  }, [config, reset])

  if (isLoading) return <span className="loading loading-spinner loading-md" />
  if (isError && !notFound)
    return <p className="text-error">ไม่สามารถโหลดการตั้งค่าอุปกรณ์ได้</p>

  const onSubmit = handleSubmit((values) => upsert.mutate(values))

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {notFound && (
        <p className="text-sm text-base-content/60">
          ยังไม่มีการตั้งค่าสำหรับอุปกรณ์นี้
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            disabled={!canManage}
            {...register('dhcp')}
          />
          DHCP (Wi-Fi)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            disabled={!canManage}
            {...register('dhcpEth')}
          />
          DHCP (Ethernet)
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEXT_FIELDS.map((field) => (
          <div key={field.key} className="form-control">
            <label
              className="label-text mb-1 block text-xs"
              htmlFor={`config-${field.key}`}
            >
              {field.label}
            </label>
            <input
              id={`config-${field.key}`}
              className="input input-sm input-bordered w-full"
              disabled={!canManage}
              {...register(field.key)}
            />
          </div>
        ))}
      </div>

      {canManage && (
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={upsert.isPending}
          >
            {upsert.isPending && (
              <span className="loading loading-spinner loading-xs" />
            )}
            บันทึกการตั้งค่า
          </button>
          {!notFound && (
            <button
              type="button"
              className="btn btn-error btn-outline btn-sm"
              onClick={() => deleteDialogRef.current?.showModal()}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              ลบการตั้งค่า
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        ref={deleteDialogRef}
        title="ยืนยันลบการตั้งค่า"
        description="การตั้งค่าเครือข่ายของอุปกรณ์นี้จะถูกลบทั้งหมด"
        confirmLabel="ลบ"
        isLoading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </form>
  )
}
