import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'
import { toFormData } from '@/lib/api/formData'
import { fetchAllPages } from '@/lib/api/pagination'

// อุปกรณ์ (จุดติดตั้ง) กับกล่องฮาร์ดแวร์จริงถูกแยกเป็นคนละ entity ใน backend —
// `hardware` เป็น relation ที่อาจไม่มีถ้าจุดติดตั้งนี้ยังไม่เคยเสียบกล่องใดเลย
export const HardwareSchema = z.object({
  id: z.string(),
  serial: z.string(),
  firmware: z.string(),
  token: z.string().nullable(),
  installDate: z.string().nullable(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type Hardware = z.infer<typeof HardwareSchema>

export const DeviceSchema = z.object({
  id: z.string(),
  serial: z.string().nullable(),
  ward: z.string(),
  staticName: z.string(),
  name: z.string().nullable(),
  status: z.boolean(),
  seq: z.number(),
  location: z.string().nullable(),
  remark: z.string().nullable(),
  position: z.string().nullable(),
  positionPic: z.string().nullable(),
  online: z.boolean(),
  tag: z.string().nullable(),
  hardware: HardwareSchema.nullable(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type Device = z.infer<typeof DeviceSchema>

export const CreateDeviceSchema = z.object({
  serial: z.string().min(1),
  ward: z.string().min(1),
  staticName: z.string().min(1).optional(),
  name: z.string().optional(),
  status: z.boolean(),
  seq: z.number().int(),
  firmware: z.string().min(1),
  remark: z.string().optional(),
  position: z.string().optional(),
  location: z.string().optional(),
  tag: z.string().optional(),
  installDate: z.string().optional(),
})
export type CreateDeviceInput = z.infer<typeof CreateDeviceSchema> & {
  positionPic?: File
}
export type UpdateDeviceInput = Partial<z.infer<typeof CreateDeviceSchema>> & {
  positionPic?: File
}

// event `device` จาก SSE (`/devices/stream`, `/stream?channels=device,...`) — mirror
// backend DeviceChangedEvent เสมอส่ง device row เต็มก้อนมาด้วย ไม่ต้อง GET /devices ซ้ำ
export const DeviceChangedEventSchema = z.object({
  action: z.enum(['created', 'updated', 'swapped', 'online', 'offline']),
  deviceId: z.string(),
  staticName: z.string(),
  serial: z.string().nullable(),
  previousSerial: z.string().nullable().optional(),
  device: DeviceSchema,
  at: z.string(),
  actor: z
    .object({ id: z.string(), name: z.string(), role: z.string() })
    .optional(),
})
export type DeviceChangedEvent = z.infer<typeof DeviceChangedEventSchema>

export const DeviceAssignmentSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  serial: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  reason: z.string().nullable(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type DeviceAssignment = z.infer<typeof DeviceAssignmentSchema>

export const SwapDeviceSchema = z.object({
  serial: z.string().min(1).max(150),
  reason: z.string().max(255).optional(),
})
export type SwapDeviceInput = z.infer<typeof SwapDeviceSchema>

export const SwapDeviceResultSchema = z.object({
  device: DeviceSchema,
  previousSerial: z.string().nullable(),
  assignment: DeviceAssignmentSchema,
})
export type SwapDeviceResult = z.infer<typeof SwapDeviceResultSchema>

export async function getDevices(
  params: { search?: string } = {},
): Promise<Device[]> {
  return fetchAllPages(async (pageParams) => {
    const { data } = await apiClient.get('/devices', {
      params: { ...pageParams, ...params },
    })
    return z.array(DeviceSchema).parse(data)
  })
}

export async function getDevice(serial: string): Promise<Device> {
  const { data } = await apiClient.get(`/devices/${encodeURIComponent(serial)}`)
  return DeviceSchema.parse(data)
}

// `serial` เป็นของกล่องฮาร์ดแวร์และอาจว่างได้ถ้าจุดติดตั้งยังไม่มีกล่องเสียบอยู่ —
// หน้าเว็บจึงต้องอ้างอิงจุดติดตั้งด้วย staticName ซึ่งคงที่และไม่มีวันว่างแทน
export async function getDeviceByStaticName(
  staticName: string,
  config?: { headers?: Record<string, string> },
): Promise<Device> {
  const { data } = await apiClient.get(
    `/devices/by-name/${encodeURIComponent(staticName)}`,
    config,
  )
  return DeviceSchema.parse(data)
}

export async function createDevice(dto: CreateDeviceInput): Promise<Device> {
  const { data } = await apiClient.post('/devices', toFormData(dto))
  return DeviceSchema.parse(data)
}

export async function updateDevice(
  id: string,
  dto: UpdateDeviceInput,
): Promise<Device> {
  const { data } = await apiClient.put(
    `/devices/${encodeURIComponent(id)}`,
    toFormData(dto),
  )
  return DeviceSchema.parse(data)
}

export async function swapDevice(
  staticName: string,
  dto: SwapDeviceInput,
): Promise<SwapDeviceResult> {
  const { data } = await apiClient.post(
    `/devices/by-name/${encodeURIComponent(staticName)}/swap`,
    dto,
  )
  return SwapDeviceResultSchema.parse(data)
}

export async function getDeviceAssignments(
  staticName: string,
): Promise<DeviceAssignment[]> {
  const { data } = await apiClient.get(
    `/devices/by-name/${encodeURIComponent(staticName)}/assignments`,
  )
  return z.array(DeviceAssignmentSchema).parse(data)
}
