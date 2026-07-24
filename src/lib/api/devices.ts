import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'

export const DeviceSchema = z.object({
  id: z.string(),
  serial: z.string(),
  ward: z.string(),
  staticName: z.string(),
  name: z.string().nullable(),
  status: z.boolean(),
  seq: z.number(),
  firmware: z.string(),
  remark: z.string().nullable(),
  position: z.string().nullable(),
  positionPic: z.string().nullable(),
  online: z.boolean(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type Device = z.infer<typeof DeviceSchema>

export const CreateDeviceSchema = z.object({
  serial: z.string().min(1),
  ward: z.string().min(1),
  staticName: z.string().min(1),
  name: z.string().optional(),
  status: z.boolean(),
  seq: z.number().int(),
  firmware: z.string().min(1),
  remark: z.string().optional(),
  position: z.string().optional(),
  positionPic: z.string().optional(),
})
export type CreateDeviceInput = z.infer<typeof CreateDeviceSchema>

export async function getDevices(): Promise<Device[]> {
  const { data } = await apiClient.get('/devices')
  return z.array(DeviceSchema).parse(data)
}

export async function getDevice(serial: string): Promise<Device> {
  const { data } = await apiClient.get(`/devices/${encodeURIComponent(serial)}`)
  return DeviceSchema.parse(data)
}

export async function createDevice(dto: CreateDeviceInput): Promise<Device> {
  const { data } = await apiClient.post('/devices', dto)
  return DeviceSchema.parse(data)
}
