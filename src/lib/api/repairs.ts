import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'
import type { PaginationQuery } from '@/lib/api/pagination'

export const RepairSchema = z.object({
  id: z.string(),
  seq: z.number(),
  serial: z.string(),
  devName: z.string().nullable(),
  info: z.string().nullable(),
  info1: z.string().nullable(),
  info2: z.string().nullable(),
  address: z.string().nullable(),
  ward: z.string().nullable(),
  detail: z.string().nullable(),
  phone: z.string().nullable(),
  status: z.string().nullable(),
  warrantyStatus: z.string().nullable(),
  remark: z.string().nullable(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type Repair = z.infer<typeof RepairSchema>

export const CreateRepairSchema = z.object({
  serial: z.string().min(1),
  devName: z.string().optional(),
  info: z.string().optional(),
  info1: z.string().optional(),
  info2: z.string().optional(),
  address: z.string().optional(),
  ward: z.string().optional(),
  detail: z.string().optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
  warrantyStatus: z.string().optional(),
  remark: z.string().optional(),
})
export type CreateRepairInput = z.infer<typeof CreateRepairSchema>
export type UpdateRepairInput = Partial<CreateRepairInput>

export async function getRepairs(
  params: PaginationQuery = {},
): Promise<Repair[]> {
  const { data } = await apiClient.get('/repairs', { params })
  return z.array(RepairSchema).parse(data)
}

export async function getRepairsBySerial(
  serial: string,
  params: PaginationQuery = {},
): Promise<Repair[]> {
  const { data } = await apiClient.get(
    `/repairs/by-serial/${encodeURIComponent(serial)}`,
    { params },
  )
  return z.array(RepairSchema).parse(data)
}

export async function createRepair(dto: CreateRepairInput): Promise<Repair> {
  const { data } = await apiClient.post('/repairs', dto)
  return RepairSchema.parse(data)
}

export async function updateRepair(
  id: string,
  dto: UpdateRepairInput,
): Promise<Repair> {
  const { data } = await apiClient.put(
    `/repairs/${encodeURIComponent(id)}`,
    dto,
  )
  return RepairSchema.parse(data)
}

export async function deleteRepair(id: string): Promise<Repair> {
  const { data } = await apiClient.delete(`/repairs/${encodeURIComponent(id)}`)
  return RepairSchema.parse(data)
}
