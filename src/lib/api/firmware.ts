import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'
import { hasFile, toFormData } from '@/lib/api/formData'
import type { PaginationQuery } from '@/lib/api/pagination'

export const FirmwareSchema = z.object({
  id: z.string(),
  version: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  fileKey: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  checksum: z.string().nullable().optional(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type Firmware = z.infer<typeof FirmwareSchema>

export const CreateFirmwareSchema = z.object({
  version: z.string().min(1, 'กรุณากรอกเวอร์ชัน'),
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  description: z.string().optional(),
})
export type CreateFirmwareInput = z.infer<typeof CreateFirmwareSchema> & {
  file: File
}

// version เป็นค่าคงที่หลังสร้าง — backend เมินฟิลด์นี้ถ้าส่งไปตอนแก้ไข
export const UpdateFirmwareSchema = CreateFirmwareSchema.omit({
  version: true,
}).partial()
export type UpdateFirmwareInput = z.infer<typeof UpdateFirmwareSchema> & {
  file?: File
}

export async function getFirmwares(
  params: PaginationQuery = {},
): Promise<Firmware[]> {
  const { data } = await apiClient.get('/firmware', { params })
  return z.array(FirmwareSchema).parse(data)
}

export async function getFirmware(id: string): Promise<Firmware> {
  const { data } = await apiClient.get(`/firmware/${encodeURIComponent(id)}`)
  return FirmwareSchema.parse(data)
}

export async function createFirmware(
  dto: CreateFirmwareInput,
): Promise<Firmware> {
  const { data } = await apiClient.post('/firmware', toFormData(dto))
  return FirmwareSchema.parse(data)
}

export async function updateFirmware(
  id: string,
  dto: UpdateFirmwareInput,
): Promise<Firmware> {
  const { data } = await apiClient.put(
    `/firmware/${encodeURIComponent(id)}`,
    hasFile(dto) ? toFormData(dto) : dto,
  )
  return FirmwareSchema.parse(data)
}

export async function deleteFirmware(id: string): Promise<Firmware> {
  const { data } = await apiClient.delete(
    `/firmware/${encodeURIComponent(id)}`,
  )
  return FirmwareSchema.parse(data)
}

// endpoint นี้ stream ไฟล์ binary ดิบ ไม่ผ่าน envelope — ต้องลิงก์ตรง ห้ามยิงผ่าน apiClient
export function getFirmwareDownloadUrl(version: string): string {
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/firmware/download/${encodeURIComponent(version)}`
}
