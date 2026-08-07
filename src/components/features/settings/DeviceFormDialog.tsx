'use client'

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { ImageUploadField } from '@/components/ui/ImageUploadField'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import type {
  CreateDeviceInput,
  Device,
  UpdateDeviceInput,
} from '@/lib/api/devices'
import { useHospitals } from '@/hooks/useHospitals'
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
    isSubmitting?: boolean
  }
>(function DeviceFormDialog({ onCreate, onUpdate, isSubmitting }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // เก็บทั้ง device ไม่ใช่แค่ id เพราะต้องใช้ positionPic เดิมมาแสดงเป็น preview
  const [editing, setEditing] = useState<Device | null>(null)
  // ใช้กรองวอร์ดที่จะให้เลือกเท่านั้น ไม่ได้ส่งขึ้น backend เพราะ Device ไม่มีฟิลด์โรงพยาบาล
  const [hospitalId, setHospitalId] = useState('')
  // ค่า ward เดิมของอุปกรณ์ที่ไม่ตรงกับ ward ของโรงพยาบาลไหนเลย (ข้อมูล legacy) — เก็บไว้
  // เป็นตัวเลือกพิเศษกันค่าหายตอนแก้ไข จนกว่าผู้ใช้จะเลือกวอร์ดจริงแทน
  const [legacyWard, setLegacyWard] = useState<string | null>(null)

  const { data: hospitals } = useHospitals()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DeviceFormValues>({ defaultValues: {} })

  const selectedHospital = hospitals?.find(
    (hospital) => hospital.id === hospitalId,
  )
  const wardOptions = useMemo(
    () => [...(selectedHospital?.ward ?? [])].sort((a, b) => a.wardSeq - b.wardSeq),
    [selectedHospital],
  )
  const hospitalSelectOptions = useMemo(
    () =>
      (hospitals ?? []).map((hospital) => ({
        value: hospital.id,
        label: hospital.hosName,
      })),
    [hospitals],
  )
  const wardSelectOptions = useMemo(() => {
    const options = wardOptions.map((ward) => ({
      value: ward.id,
      label: ward.wardName,
    }))
    if (legacyWard) {
      options.push({ value: legacyWard, label: `${legacyWard} (ค่าเดิม)` })
    }
    return options
  }, [wardOptions, legacyWard])

  function handleHospitalChange(nextHospitalId: string) {
    setHospitalId(nextHospitalId)
    setLegacyWard(null)
    const nextHospital = hospitals?.find(
      (hospital) => hospital.id === nextHospitalId,
    )
    const firstWard = [...(nextHospital?.ward ?? [])].sort(
      (a, b) => a.wardSeq - b.wardSeq,
    )[0]
    setValue('ward', firstWard?.id ?? '')
  }

  useImperativeHandle(ref, () => ({
    open: (device) => {
      setEditing(device ?? null)

      if (device) {
        // เทียบค่า ward เดิมกับทุกโรงพยาบาลก่อน เพื่อ preselect โรงพยาบาล/วอร์ดที่ตรงกัน
        // จริง — ถ้าไม่เจอเลยแสดงว่าเป็นข้อมูล legacy ที่ไม่ตรงกับวอร์ดไหนเลย
        const needle = device.ward.trim().toLowerCase()
        const matchedHospital = (hospitals ?? []).find((hospital) =>
          (hospital.ward ?? []).some(
            (ward) =>
              ward.id.toLowerCase() === needle ||
              ward.wardName.trim().toLowerCase() === needle,
          ),
        )
        if (matchedHospital) {
          setHospitalId(matchedHospital.id)
          setLegacyWard(null)
        } else {
          setHospitalId('')
          setLegacyWard(device.ward)
        }
      } else {
        setHospitalId('')
        setLegacyWard(null)
      }

      reset(
        device
          ? {
              serial: device.serial ?? undefined,
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
                โรงพยาบาล *
              </label>
              <SearchableSelect
                ariaLabel="เลือกโรงพยาบาล"
                placeholder="เลือกโรงพยาบาล"
                options={hospitalSelectOptions}
                value={hospitalId}
                onChange={handleHospitalChange}
              />
            </div>

            <div className="form-control">
              <label className="label-text mb-1 block text-xs">วอร์ด *</label>
              <Controller
                control={control}
                name="ward"
                rules={{ required: 'กรุณาเลือกวอร์ด' }}
                render={({ field }) => (
                  <SearchableSelect
                    ariaLabel="เลือกวอร์ด"
                    placeholder="เลือกวอร์ด"
                    options={wardSelectOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
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
