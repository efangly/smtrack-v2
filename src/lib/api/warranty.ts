import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'

export const WarrantySchema = z.object({
  id: z.string(),
  serial: z.string(),
  devName: z.string().nullable(),
  provider: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  remark: z.string().nullable(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type Warranty = z.infer<typeof WarrantySchema>

export const CreateWarrantySchema = z.object({
  serial: z.string().min(1),
  devName: z.string().optional(),
  provider: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  remark: z.string().optional(),
})
export type CreateWarrantyInput = z.infer<typeof CreateWarrantySchema>
export type UpdateWarrantyInput = Partial<CreateWarrantyInput>

export async function getWarranties(): Promise<Warranty[]> {
  const { data } = await apiClient.get('/warranty')
  return z.array(WarrantySchema).parse(data)
}

export async function createWarranty(
  dto: CreateWarrantyInput,
): Promise<Warranty> {
  const { data } = await apiClient.post('/warranty', dto)
  return WarrantySchema.parse(data)
}

export async function updateWarranty(
  id: string,
  dto: UpdateWarrantyInput,
): Promise<Warranty> {
  const { data } = await apiClient.put(
    `/warranty/${encodeURIComponent(id)}`,
    dto,
  )
  return WarrantySchema.parse(data)
}

export async function deleteWarranty(id: string): Promise<Warranty> {
  const { data } = await apiClient.delete(`/warranty/${encodeURIComponent(id)}`)
  return WarrantySchema.parse(data)
}
