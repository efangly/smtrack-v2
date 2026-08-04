'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { ImageUploadField } from '@/components/ui/ImageUploadField'
import type {
  CreateDeviceInput,
  Device,
  UpdateDeviceInput,
} from '@/lib/api/devices'
import { resolveDeviceImageUrl } from '@/lib/imageUrl'

export interface DeviceFormDialogHandle {
  open: (device?: Device) => void
}

type DeviceFormValues = Omit<CreateDeviceInput, 'positionPic'> & {
  positionPic?: File | null
}

const TEXT_FIELDS: { key: keyof DeviceFormValues; label: string }[] = [
  { key: 'name', label: 'ชื่ออุปกรณ์' },
  { key: 'location', label: 'สถานที่' },
  { key: 'position', label: 'ตำแหน่งติดตั้ง' },
  { key: 'tag', label: 'แท็ก' },
  { key: 'remark', label: 'หมายเหตุ' },
]

export const DeviceFormDialog = forwardRef<
  DeviceFormDialogHandle,
  {
    onCreate: (dto: CreateDeviceInput) => void
    onUpdate: (id: string, dto: UpdateDeviceInput) => void
    /** ชื่อวอร์ดที่ใช้อยู่แล้วในทะเบียน ใช้เป็นตัวช่วยเติมคำ ไม่ได้บังคับเลือก */
    wardSuggestions?: string[]
    isSubmitting?: boolean
  }
>(function DeviceFormDialog(
  { onCreate, onUpdate, wardSuggestions = [], isSubmitting },
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // เก็บทั้ง device ไม่ใช่แค่ id เพราะต้องใช้ positionPic เดิมมาแสดงเป็น preview
  const [editing, setEditing] = useState<Device | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceFormValues>({ defaultValues: {} })

  useImperativeHandle(ref, () => ({
    open: (device) => {
      setEditing(device ?? null)
      reset(
        device
          ? {
              serial: device.serial ?? undefined,
              staticName: device.staticName,
              ward: device.ward,
              name: device.name ?? undefined,
              seq: device.seq,
              status: device.status,
              // firmware อยู่บนกล่องฮาร์ดแวร์ ไม่ใช่จุดติดตั้ง — อาจว่างถ้ายังไม่เคยเสียบกล่อง
              firmware: device.hardware?.firmware ?? undefined,
              location: device.location ?? undefined,
              position: device.position ?? undefined,
              tag: device.tag ?? undefined,
              remark: device.remark ?? undefined,
              installDate: device.hardware?.installDate?.slice(0, 10),
              positionPic: null,
            }
          : {
              // react-hook-form's reset() falls back to the *current* field
              // value when a key is `undefined` — must pass '' to actually
              // clear an uncontrolled input, not undefined.
              serial: '',
              staticName: '',
              ward: '',
              name: '',
              seq: 0,
              status: true,
              firmware: '',
              location: '',
              position: '',
              tag: '',
              remark: '',
              installDate: '',
              positionPic: null,
            },
      )
      dialogRef.current?.showModal()
    },
  }))

  const submit = handleSubmit((values) => {
    const { positionPic, ...rest } = values
    const dto = { ...rest, ...(positionPic ? { positionPic } : {}) }
    if (editing) {
      onUpdate(editing.id, dto)
    } else {
      onCreate(dto)
    }
    dialogRef.current?.close()
  })

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-bold">
          {editing ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์'}
        </h3>
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="form-control">
              <label className="label-text mb-1 block text-xs">Serial *</label>
              <input
                className="input input-sm input-bordered w-full font-mono"
                {...register('serial', { required: 'กรุณากรอก serial' })}
              />
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.serial?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                ชื่อคงที่ (staticName) *
              </label>
              <input
                className="input input-sm input-bordered w-full font-mono"
                // staticName เป็นตัวอ้างอิงจุดติดตั้งในทุก URL — เปลี่ยนแล้วลิงก์เดิมจะเสีย
                disabled={Boolean(editing)}
                {...register('staticName', {
                  required: 'กรุณากรอกชื่อคงที่',
                })}
              />
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.staticName?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">วอร์ด *</label>
              {/* `ward` ของ log service เป็น free text (เช่น "ICU", "OPD") คนละชุดกับ
                  วอร์ดของ auth service — ห้ามทำเป็น select ที่ส่ง ward id ไป */}
              <input
                className="input input-sm input-bordered w-full"
                list="device-ward-suggestions"
                {...register('ward', { required: 'กรุณากรอกวอร์ด' })}
              />
              <datalist id="device-ward-suggestions">
                {wardSuggestions.map((ward) => (
                  <option key={ward} value={ward} />
                ))}
              </datalist>
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.ward?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                Firmware *
              </label>
              <input
                className="input input-sm input-bordered w-full"
                {...register('firmware', { required: 'กรุณากรอก firmware' })}
              />
              <span className="mt-1 text-xs text-error empty:hidden">
                {errors.firmware?.message}
              </span>
            </div>

            {TEXT_FIELDS.map((field) => (
              <div key={field.key} className="form-control">
                <label className="label-text mb-1 block text-xs">
                  {field.label}
                </label>
                <input
                  className="input input-sm input-bordered w-full"
                  {...register(field.key)}
                />
              </div>
            ))}

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">ลำดับ</label>
              <input
                type="number"
                className="input input-sm input-bordered w-full"
                {...register('seq', { valueAsNumber: true })}
              />
            </div>

            {/* ช่องรูปอยู่คอลัมน์ซ้าย ให้เห็นก่อนวันที่ติดตั้ง */}
            <Controller
              control={control}
              name="positionPic"
              render={({ field }) => (
                <ImageUploadField
                  label="รูปตำแหน่งติดตั้ง"
                  currentUrl={resolveDeviceImageUrl(editing?.positionPic)}
                  value={field.value ?? null}
                  onChange={field.onChange}
                  shape="square"
                  size={72}
                  fit="contain"
                />
              )}
            />

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">
                วันที่ติดตั้ง
              </label>
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                {...register('installDate')}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                {...register('status')}
              />
              เปิดใช้งานอุปกรณ์
            </label>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => dialogRef.current?.close()}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="loading loading-spinner loading-xs" />
              )}
              บันทึก
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
})
